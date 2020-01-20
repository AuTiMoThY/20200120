/**
 * Version: 4.1.0
 * 4.1.0: add changed.cached.gulpif.filter
 */


const browserSync    = require('browser-sync').create();

const gulp           = require('gulp');
const sass           = require('gulp-sass');
const sassGlob       = require('gulp-sass-glob');
const size           = require('gulp-size');
const rename         = require('gulp-rename');
const cleanCss       = require('gulp-clean-css');
const sourcemaps     = require('gulp-sourcemaps');
const notify         = require('gulp-notify');
const plumber        = require('gulp-plumber');
const postcss        = require('gulp-postcss');
const autoprefixer   = require('autoprefixer');
const del            = require('del');
const imagemin       = require('gulp-imagemin');
const svgSprite      = require('gulp-svg-sprite');
// connect           = require('gulp-connect');
const pugInheritance = require('gulp-pug-inheritance');
const pug            = require('gulp-pug');
const changed        = require('gulp-changed');
const cached         = require('gulp-cached');
const gulpif         = require('gulp-if');
const filter         = require('gulp-filter');


sass.compiler = require('node-sass');

const path = {
	sass: '_build/sass/**/*.scss',
	css: 'dist/css',
	pug: '_build/pug/**/*.pug',
	img_ori: '_build/img_ori/*',
	images: 'dist/images',
	js: 'dist/script.js'
};


// server
// gulp.task('server', function(){
// 	connect.server({
// 		port: 8089,
// 		livereload: true
// 	});
// });



gulp.task('del', () => {
	return del([path.css]);
});

gulp.task('del-img', () => {
	return del([path.images]);
});


// Sass
gulp.task('sass', () => {
	return gulp.src(path.sass)
	.pipe(sassGlob())
	.pipe(sourcemaps.init())
	.pipe(sass({outputStyle: 'compact'}))
	.pipe(sass.sync().on('error', sass.logError))
	.pipe(postcss([autoprefixer()]))
	.pipe(size({title:'style'}))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(path.css))


	.pipe(browserSync.stream());
});

gulp.task('minifyCss', () => {
	return gulp.src(`${path.css}/*.css`)
	.pipe(rename({suffix: '.min'}))
	.pipe(cleanCss({
		// keepBreaks: true,
		// compatibility: 'ie8,+units.rem',
		debug: true
	}, (details) => {
		console.log(`${details.name} : ${details.stats.originalSize}`);
		console.log(`${details.name} : ${details.stats.minifiedSize}`);
		console.log(`${details.stats.timeSpent} ms`);
	}))
	.pipe(gulp.dest(path.css))
	.pipe(notify({ message: 'minifyCss task complete' }));
});



gulp.task('pug', () => {


	return gulp.src(path.pug)
		/////////////////////////////////////////////////////////////////////////
		// https://medium.com/@toumasaya/gulp-fighting-4-packages-51e7a2b7f61b //
		/////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////
		//https://github.com/pure180/gulp-pug-inheritance //
		////////////////////////////////////////////////////
		//only pass unchanged *main* files and *all* the partials
		.pipe(changed('./', {extension: '.html'}))

		//filter out unchanged partials, but it only works when watching
		.pipe(gulpif(global.isWatching, cached('pug')))

		//find files that depend on the files that have changed
		.pipe(pugInheritance({basedir: '_build/pug', extension: '.pug',  skip: 'node_modules'}))

		//filter out partials (folders and files starting with "_" )
		.pipe(filter(function (file) {
		    return !/\/_/.test(file.path) && !/^_/.test(file.relative);
		}))

		.pipe(pug({
			"debug": true,
			"pretty": true
		}))
		.pipe(gulp.dest('./'))
		.pipe(browserSync.stream());
});


gulp.task('image-min', () => {
	var onError = (err) => {
		notify.onError({
					title:    "Gulp image-min",
					subtitle: "Failure!",
					message:  "Error: <%= error.message %>"
				})(err);

		this.emit('end');
	};

	return gulp.src(path.img_ori)
	           .pipe(imagemin())
	           .pipe(gulp.dest(path.images));
});

gulp.task('browser-sync', gulp.series('del', 'sass', 'minifyCss', function() {
	browserSync.init({
		server: {
			baseDir: "./"
		},
		port: 8080
	});

	gulp.watch(path.sass, gulp.series('del', 'sass', 'minifyCss'));
	gulp.watch("*.html").on('change', () => {
		browserSync.notify("HTML change!!");
		browserSync.reload();
	} );
	gulp.watch(["dist/js/*.js"]).on('change', () => {
		browserSync.notify("JS change!!");
		browserSync.reload()
	});
	gulp.watch("css/*.css").on('change', () => {
		browserSync.notify("css change!!");
		browserSync.reload()
	});
	gulp.watch(path.pug, gulp.series('pug'));
	gulp.watch(path.img_ori, gulp.series('del-img', 'image-min'));
}));


config2 = {

  mode: {
    view: { // Activate the «view» mode
      bust: false,
      render: {
        scss: true // Activate Sass output (with default options)
      }
    },
    symbol: true, // Activate the «symbol» mode
  }
};
gulp.task('svg', function(){
    return gulp.src('_build/svg/*.svg')
        .pipe(plumber())
        .pipe(svgSprite(config2))
            .on('error', function(error){
                console.log(error);
            })
        .pipe(gulp.dest('_build/'))
        .pipe(gulp.dest('dist'));
})


// gulp.task('watch', function () {
// 	gulp.watch(path.sass, gulp.series('del', 'sass', 'minifyCss'));
// 	gulp.watch("*.html").on('change', browserSync.reload);
// 	gulp.watch(path.pug, gulp.series('pug'));
// });

gulp.task('default', gulp.series('browser-sync', 'image-min'));

