const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () => {
    gulp.src('src/phantom.js')
      .pipe(babel({
        presets: ['env']
      }))
      .pipe(gulp.dest('dist'))
  }
)

gulp.task('watch', () => {
    gulp.watch('src/phantom.js', ['default'])
  }
)