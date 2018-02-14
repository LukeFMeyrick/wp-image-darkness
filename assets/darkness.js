// ------------------------------------
//
// Image Darkness Meta
//
// ------------------------------------

(function($) {

	var ImageDarkness = {

		// ------------------------------------
		// Initialize
		// ------------------------------------

		init: function() {

            this.extendUploader();

		},

        extendUploader: function() {

            if (typeof wp.Uploader === 'function') {
                console.log('UPLOADER');

                $.extend( wp.Uploader.prototype, {

                    init : function() { // plupload 'PostInit'
                        this.uploader.bind('BeforeUpload', function(file) {
                            console.log('BeforeUpload file=%o', file);
                        });
                    },
                    success : function( file_attachment ) {
                        ImageDarkness.getDarkness(file_attachment.changed.url,function(brightness){
                            console.log(brightness);
                            console.log(file_attachment);
                            ImageDarkness.updateMeta(file_attachment.attributes,brightness);
                        });
                    }
                });

            }

        },

        updateMeta: function(obj,darkness) {

            var data = ImageDarkness.getImage(obj,darkness);

            $.ajax({
				method: "POST",
				url: IMAGE_DARKNESS.root + 'wp/v2/media/' + obj.id + '/meta?key=image_darkness_mate&value=' + parseInt(darkness),
				// data: data,

				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', IMAGE_DARKNESS.nonce );
				},

				success : function( response ) {
					console.log( response );
					console.log( 'SUCCESS' );

				},

				error : function( response ) {
					console.log( response );
					console.log( 'ERROR' );
				}

			});
        },

        getImage: function(obj,darkness) {

			var id = obj.id;
			var title = obj.title;
			var author = obj.author;

            var data = {
				id: id,
				author: author,
                title: title,
				'image_darkness': parseInt(darkness)
            };

			console.table(data);

			return data;
        },

        getDarkness: function(imageSrc,callback) {
            var img = document.createElement("img");
            img.src = imageSrc;
            img.style.display = "none";
            document.body.appendChild(img);

            var colorSum = 0;

            img.onload = function() {
                // create canvas
                var canvas = document.createElement("canvas");
                canvas.width = this.width;
                canvas.height = this.height;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(this,0,0);

                var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
                var data = imageData.data;
                var r,g,b,avg;

                for(var x = 0, len = data.length; x < len; x+=4) {
                    r = data[x];
                    g = data[x+1];
                    b = data[x+2];

                    avg = Math.floor((r+g+b)/3);
                    colorSum += avg;
                }

                var brightness = Math.floor(colorSum / (this.width*this.height));
                callback(brightness);
            };
        },

		createPost: function($post,tags=null) {

            var data = ImageDarkness.buildPost($post,tags);

			$.ajax({
				method: "POST",
				url: IMAGE_DARKNESS.root + 'wp/v2/posts',
				data: data,

				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', IMAGE_DARKNESS.nonce );
				},

				success : function( response ) {
					console.log( response );
					console.log( 'SUCCESS' );

					if (data.status == 'publish') {
						alert( IMAGE_DARKNESS.success );
					} else if (data.status == 'draft') {
						alert( IMAGE_DARKNESS.saved );
					}
				},

				error : function( response ) {
					console.log( response );
					console.log( 'ERROR' );

					if (data.author == 'login') {
						alert( IMAGE_DARKNESS.login );
					} else {
						alert( IMAGE_DARKNESS.failure );
					}
				}

			});

		},

        buildPost: function($post,tags=null) {

			var author = $post.find('[name="author"]' ).val();
            var title = $post.find('[name="question"]').val();
            var category = $post.find('.cat-checkbox[type="checkbox"]:checked');
            var strength = $post.find('[name="strength"]' ).val();
			var parent = $post.find('[name="parent"]').val();

            var categories = [];

			if (tags != null) {
				var tags = tags;
			} else {
				var tags = [];
			}

			category.each(function(){
				var val = $(this).val();
				categories.push(val);
			});

            if ($post.find('[data-submit="true"]').is('[name="post"]')) {
				var status = 'publish';
			} else {
				var status = 'draft';
			}

            var data = {
				author: author,
                title: title,
				status: status,
				// parent: parent,
				categories: categories,
				tags: tags,
				'question_strength': parseInt(strength)
            };

			console.table(data);

			return data;
        },



	};

	window.ImageDarkness = ImageDarkness;
	ImageDarkness.init();

})(jQuery);
//
// (function($) {
//
//     function getImageLightness(imageSrc,callback) {
//         var img = document.createElement("img");
//         img.src = imageSrc;
//         img.style.display = "none";
//         document.body.appendChild(img);
//
//         var colorSum = 0;
//
//         img.onload = function() {
//             // create canvas
//             var canvas = document.createElement("canvas");
//             canvas.width = this.width;
//             canvas.height = this.height;
//
//             var ctx = canvas.getContext("2d");
//             ctx.drawImage(this,0,0);
//
//             var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
//             var data = imageData.data;
//             var r,g,b,avg;
//
//             for(var x = 0, len = data.length; x < len; x+=4) {
//                 r = data[x];
//                 g = data[x+1];
//                 b = data[x+2];
//
//                 avg = Math.floor((r+g+b)/3);
//                 colorSum += avg;
//             }
//
//             var brightness = Math.floor(colorSum / (this.width*this.height));
//             callback(brightness);
//         };
//     }
//
//     if (typeof wp.Uploader === 'function') {
//
//         $.extend( wp.Uploader.prototype, {
//
//             init : function() { // plupload 'PostInit'
//                 this.uploader.bind('BeforeUpload', function(file) {
//                     console.log('BeforeUpload file=%o', file);
//                 });
//             },
//             success : function( file_attachment ) {                     // alert('Upload Complete!');
//                 getImageLightness(file_attachment.changed.url,function(brightness){
//                     console.log(brightness);
//                 });
//             }
//         });
//
//     }
//
// })(jQuery);
