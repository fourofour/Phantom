class Phantom  {
  constructor () {
    //setting top access to the Phantom Object
    let that = this
    
    // Keep our global setting here
    this.__proto__._setting = {
      debugMod: true
    }

    // Setting top our core which will be used in all different places such as in JS Native, jQuery and ...
    this.__proto__._core = {
      // import from https://gist.github.com/jlong/eff01958791d3e0bf10c with few modification
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

        return { left: left, top: top };
      },

      // function to make elements fast
      createElement: function ({ type = 'DIV', classList = [], children = [], text = '', style = [], attributes = [], attr = attributes }) {
        let element = document.createElement(type)

        // add Class list
        if (classList.length > 0)
          element.className = classList.join(' ')

        // appending children
        if (children.length > 0)
          children.forEach(function (item, index, array) {
            element.appendChild(item)
          })
        else
        // or appending the text node
        if (text.length > 0)
          element.appendChild(document.createTextNode(text))

        // adding inline styles
        if (style.length > 0) {
          style.forEach(function (value, index, array) {
            let key = Object.keys(value)[0]

            element.style[key] = value[key]
          })
        }

        //adding custom attributes
        if (attr.length > 0) {
          attr.forEach(function (value, index, array) {
            let key = Object.keys(value)[0]

            element.setAttribute(key, value[key])
          })
        }

        return element
      },
      init: {
        add: function (name, callback) {
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
      tooltip: new Map()
    }

    this.__proto__._native = {
      /*
      * Tooltip
      *
      *   you can access it by adding following attribute [data-ph-tooltip]
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
              direction = 'top'

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
                  top: position.top + (height / 2) - 15 + 'px',
                  right: position.left + width + 7 + 'px'
                }
                break
              case 'right':
                location = {
                  top: position.top + (height / 2) - 15 + 'px',
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
      }
    }

    this._core.init.add('tooltip', that._native.tooltip)

    document.addEventListener('DOMContentLoaded', function (event) {
      that._core.init.run()
    })
  }

}

let phantom = new Phantom()

