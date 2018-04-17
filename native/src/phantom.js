class Phantom  {
  constructor () {
    // Setting top access to the Phantom Object
    let that = this
    
    // Keep our global setting here
    this.__proto__._setting = {
      debugMod: true
    }

    // Setting top our core which will be used in all different places such as in JS Native, jQuery and ...
    this.__proto__._core = {
      // Imported from https://gist.github.com/jlong/eff01958791d3e0bf10c with few modification
      getViewportOffset(element) {
        let node = element
        let left = node.offsetLeft,
          top = node.offsetTop

        node = node.parentNode

        do {
          if (node.nodeName !== '#document') {
            let styles = getComputedStyle(node)
            let position = styles.getPropertyValue('position')

            left -= node.scrollLeft
            top -= node.scrollTop

            if (/relative|absolute|fixed/.test(position)) {
              left += parseInt(styles.getPropertyValue('border-left-width'), 10)
              top += parseInt(styles.getPropertyValue('border-top-width'), 10)

              left += node.offsetLeft
              top += node.offsetTop
            }

            node = position === 'fixed' ? null : node.parentNode
          } else {
            node = null
          }
        } while (node)

        return { left: left, top: top }
      },

      // Function for toggle class on one element
      toggle: function ({ className, element }) {
        let classList = element.className.split(' '),
          index

        index = classList.indexOf(className)

        if ( index > -1 )
          classList.splice(index, 1)
        else
          classList.push(className)

        element.className = classList.join(' ')
      },

      // Function to add class to one element
      addClass: function ({ className, element }) {
        let classList = element.className.split(' '),
          index

        index = classList.indexOf(className)

        if (index === -1 )
          classList.push(className)

        element.className = classList.join(' ')
      },

      // Function to remove class to one element
      removeClass: function ({ className, element }) {
        let classList = element.className.split(' '),
          index

        index = classList.indexOf(className)

        if (index > -1 )
          classList.splice(index, 1)

        element.className = classList.join(' ')
      },

      // Function to make elements fast
      createElement: function ({ type = 'DIV', classList = [], children = [], text = '', style = [], attributes = [], attr = attributes }) {
        let element = document.createElement(type)

        // Add class list
        if (classList.length > 0)
          element.className = classList.join(' ')

        // Appending children
        if (children.length > 0)
          children.forEach(function (item, index, array) {
            element.appendChild(item)
          })
        else
        // Or appending the text node
        if (text.length > 0)
          element.appendChild(document.createTextNode(text))

        // Adding inline styles
        if (style.length > 0)
          style.forEach(function (value, index, array) {
            let key = Object.keys(value)[0]

            element.style[key] = value[key]
          })

        // Adding custom attributes
        if (attr.length > 0)
          attr.forEach(function (value, index, array) {
            let key = Object.keys(value)[0]

            element.setAttribute(key, value[key])
          })

        return element
      },
      init: {
        add: function ({ name, callback }) {
          if (name === undefined || callback === undefined || this.list.has(name))
            return null
          else
            this.list.set(name,  callback)
        },
        remove: function ({ name }) {
          if (name !== undefined && this.list.has(name))
            this.list.delete(name)
          else
           return null
        },
        clear: function () {
          this.list.clear()
        },
        list: new Map(),
        run: function () {
          this.list.forEach(function (value, index, map) {
            if (that._setting.debugMod)
              console.log("Initializing " + index)

            value()

            if (that._setting.debugMod)
              console.log("Finished " + index)
          })
        }
      }
    }

    // We keep out live values here
    this.__proto__._live = {
      id: {
        get: function () {
          return this.current++
        },
        current: 0
      },
      register: function (nameSpace) {
        that._live[nameSpace] = new Map()
      },
      remove: function (nameSpace) {
        delete that._live[nameSpace]
      }
    }

    this.__proto__._native = {
      /*
      * Tooltip
      *
      *   you can access it by adding following attribute [data-ph-tooltip] for the tooltip text and
      *   [data-ph-pos] = [top|bottom|right|left|undefined] for tooltip location
      *
      * */
      tooltip: function (querySelector) {
        let list

        if (querySelector === undefined) {
          list = document.querySelectorAll('[data-ph-tooltip]')
        } else {
          list = document.querySelectorAll(querySelector)
        }

        for (let i = 0; i < list.length; i++) {
          let item = list[i]

          item.addEventListener('mouseover', function (event) {
            let tooltip,
              position,
              element,
              id,
              height,
              width,
              location,
              direction = item.getAttribute('data-ph-pos') ?  item.getAttribute('data-ph-pos') : 'top'

            height = item.clientHeight
            width = item.clientWidth

            if (item.hasAttribute('data-ph-id')) {
              id = item.getAttribute('data-ph-id')
            } else {
              id = that._live.id.get()

              item.setAttribute('data-ph-id', id)
            }

            position = that._core.getViewportOffset(item)

            switch (direction) {
              case 'left':
                location = {
                  top: position.top + (height / 2) - 10 + 'px',
                  right: position.left + width + 7 + 'px'
                }
                break
              case 'right':
                location = {
                  top: position.top + (height / 2) - 10 + 'px',
                  left: position.left + width + 7 + 'px'
                }
                break
              case 'bottom':
                location = {
                  top: position.top + height + 7 + 'px',
                  left: position.left + (width / 2) + 'px'
                }
                break
              default:
                location = {
                  top: position.top - height - 10 + 'px',
                  left: position.left + (width / 2) + 'px'
                }
                break
            }

            tooltip = item.getAttribute('data-ph-tooltip')

            element = that._core.createElement({
              classList: ['tooltip', direction],
              text: tooltip,
              style: [{top: location.top}, {left: location.left}, {right: location.right}]
            })

            that._live.tooltip.set(id.toString(), element)

            document.body.appendChild(element)
          }, false)

          item.addEventListener('mouseleave', function(event) {
            let id = event.target.getAttribute('data-ph-id'),
              element

            element = that._live.tooltip.get(id)

            element.remove()

            that._live.tooltip.delete(id)
          }, false)
        }
      },

      /*
      * Carousel is function to manage some adding and removing class by timer
      *
      * */
      carousel: function (querySelector) {
        let list

        if (querySelector === undefined) {
          list = document.querySelectorAll('[data-ph-carousel]')
        } else {
          list = document.querySelectorAll(querySelector)
        }

        for (let i = 0; i < list.length; i++) {
          let item = list[i]

          let timeInterval = item.getAttribute('data-ph-carousel'),
            id = item.getAttribute('data-ph-id')

          timeInterval = timeInterval ? parseInt(timeInterval) : 5000
          id = id ? id : that._live.id.get()

          if (!item.hasAttribute('data-ph-id'))
            item.setAttribute('data-ph-id', id)

          /*
          * We build a carousel object here and store it in _live so we can have access to it later with full functionality
          *
          * */
          let carousel = {
            indicators: item.querySelectorAll('.carousel.indicator'),
            slides: item.querySelectorAll('.carousel.slide'),
            next: item.querySelector('.carousel.next'),
            prev: item.querySelector('.carousel.prev'),
            timeInterval,
            timeout: null,
            cleaner: function () {
              clearInterval(carousel.timer)
              clearTimeout(carousel.timeout)

              for (let i = 0; i < carousel.slides.length; i++ )
                if (carousel.slides[i].className.split(' ').indexOf('prev') > -1)
                  that._core.removeClass({
                    className: 'prev',
                    element: carousel.slides[i]
                  })
                else
                  if (carousel.slides[i].className.split(' ').indexOf('next') > -1)
                    that._core.removeClass({
                      className: 'next',
                      element: carousel.slides[i]
                    })
            },
            switchWithIndicator: function ({ event, index, callback }) {
              carousel.cleaner()

              let activeIndex = 0

              for (let i = 0; i < carousel.slides.length; i++) {
                let classList = carousel.slides[i].className.split(' ')

                if (classList.indexOf('active') > -1) {
                  activeIndex = i
                }
              }

              that._core.addClass({
                className: 'prev',
                element: carousel.slides[activeIndex]
              })
              that._core.addClass({
                className: 'next',
                element: carousel.slides[index]
              })

              carousel.timeout = setTimeout(function () {
                that._core.removeClass({
                  className: 'prev',
                  element: carousel.slides[activeIndex]
                })
                that._core.removeClass({
                  className: 'active',
                  element: carousel.slides[activeIndex]
                })

                that._core.removeClass({
                  className: 'next',
                  element: carousel.slides[index]
                })
                that._core.addClass({
                  className: 'active',
                  element: carousel.slides[index]
                })

                that._core.removeClass({
                  className: 'active',
                  element: carousel.indicators[activeIndex]
                })

                that._core.addClass({
                  className: 'active',
                  element: carousel.indicators[index]
                })

                carousel.setTimer()

                if (callback)
                  callback()
              }, 1000)
            },
            nextSlide: function ({ callback } = {}) {
              carousel.cleaner()

              if (carousel.slides.length > 1) {
                let index = 0,
                  next = 1

                for (let i = 0; i < carousel.slides.length; i++) {
                  let classList = carousel.slides[i].className.split(' ')

                  if (classList.indexOf('active') > -1) {
                    index = i
                  }
                }

                if (index === carousel.slides.length - 1)
                  next = 0
                else
                  next = index + 1

                that._core.addClass({
                  className: 'prev',
                  element: carousel.slides[index]
                })
                that._core.addClass({
                  className: 'next',
                  element: carousel.slides[next]
                })

                carousel.timeout = setTimeout(function () {
                  that._core.removeClass({
                    className: 'prev',
                    element: carousel.slides[index]
                  })
                  that._core.removeClass({
                    className: 'active',
                    element: carousel.slides[index]
                  })

                  that._core.removeClass({
                    className: 'next',
                    element: carousel.slides[next]
                  })
                  that._core.addClass({
                    className: 'active',
                    element: carousel.slides[next]
                  })

                  that._core.removeClass({
                    className: 'active',
                    element: carousel.indicators[index]
                  })

                  that._core.addClass({
                    className: 'active',
                    element: carousel.indicators[next]
                  })

                  carousel.setTimer()

                  if (callback)
                    callback()
                }, 1000)
              }
            },
            prevSlide: function ({ callback } = {}) {
              carousel.cleaner()

              if (carousel.slides.length > 1) {
                let index = 0,
                  next = carousel.slides.length

                for (let i = 0; i < carousel.slides.length; i++) {
                  let classList = carousel.slides[i].className.split(' ')

                  if (classList.indexOf('active') > -1) {
                    index = i
                  }
                }

                if (index === 0)
                  next = carousel.slides.length - 1
                else
                  next = index - 1

                that._core.addClass({
                  className: 'prev',
                  element: carousel.slides[index]
                })
                that._core.addClass({
                  className: 'next',
                  element: carousel.slides[next]
                })

                carousel.timeout = setTimeout(function () {
                  that._core.removeClass({
                    className: 'prev',
                    element: carousel.slides[index]
                  })
                  that._core.removeClass({
                    className: 'active',
                    element: carousel.slides[index]
                  })

                  that._core.removeClass({
                    className: 'next',
                    element: carousel.slides[next]
                  })
                  that._core.addClass({
                    className: 'active',
                    element: carousel.slides[next]
                  })

                  that._core.removeClass({
                    className: 'active',
                    element: carousel.indicators[index]
                  })

                  that._core.addClass({
                    className: 'active',
                    element: carousel.indicators[next]
                  })

                  carousel.setTimer()

                  if (callback)
                    callback()
                }, 1000)
              }
            },
            id,
            timer: null,
            setTimer: function () {
              carousel.timer = setInterval(function () {
                carousel.nextSlide()
              }, timeInterval)
            }
          }

          carousel.setTimer()

          carousel.next.addEventListener('click', function (event) {
            event.preventDefault()

            carousel.nextSlide()
          })
          
          carousel.prev.addEventListener('click', function (event) {
            event.preventDefault()

            carousel.prevSlide()
          })

          for (let i = 0; i < carousel.indicators.length; i++) {
            carousel.indicators[i].addEventListener('click', function (event) {
              let index = i
              carousel.switchWithIndicator({
                event,
                index
              })
            }, false)
          }

          // that._live.carousel.set(id, carousel)
        }
      }
    }

    /*
    * Basically export is for add direct property or prototype to main phantom object for easy access to its callback
    *
    * */
    this.__proto__._export = {
      list: new Map(),
      register: function ({ name, callback }) {
        that._export.list.set(name, callback)
      },
      remove: function ({ name }) {
        that._export.list.delete(name)
      },
      attach: function ({ name }) {
        that[name] = that._export.list.get(name)
      },
      detach: function ({ name }) {
        delete that[name]
      },
      attachAll: function () {
        that._export.list.forEach(function (value, key, map) {
          that._export.attach({ name: key })
        })
      },
      detachAll: function () {
        that._export.list.forEach(function (value, key, map) {
          that._export.detach({ name: key })
        })
      }
    }

    /*
    * Adding our export section to the _core init to run it when page is loaded ( attach all )
    *
    * */
    this._core.init.add({
      name: '_export',
      callback: that._export.attachAll
    })

    /*
    * Registering our tooltip in _live
    * Adding tooltip to _core so it can run when page is loaded once
    * Registering tooltip to _export so we can have easy access to it
    *
    * */

    this._live.register('tooltip')
    this._core.init.add({
      name: 'tooltip',
      callback:  that._native.tooltip
    })
    this._export.register({
      name: 'tooltip',
      callback:  that._native.tooltip
    })

    /*
    * Registering our carousel in _live
    * Adding carousel to _core so it can run when page is loaded once
    * Registering carousel to _export so we can have easy access to it
    *
    * */

    this._live.register('carousel')
    this._core.init.add({
      name: 'carousel',
      callback:  that._native.carousel
    })
    this._export.register({
      name: 'carousel',
      callback:  that._native.carousel
    })

    /*
    * Attaching out _core to lunch when page is loaded
    *
    * */
    document.addEventListener('DOMContentLoaded', function (event) {
      that._core.init.run()
    })
  }
}

let ph = new Phantom()
