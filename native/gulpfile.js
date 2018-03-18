const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () =>
  gulp.src('src/main.js')
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(gulp.dest('dist/script'))
)

gulp.task('watch', () =>
  gulp.watch('src/main.js', ['default'])
)