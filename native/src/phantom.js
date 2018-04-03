class Phantom  {
  constructor () {
    //setting up access to the Phantom Object
    let that = this
    
    // Keep our global setting here
    this.__proto__._setting = {
      debugMod: true
    }

    // Setting up our core which will be used in all different places such as in JS Native, jQuery and ...
    this.__proto__._core = {
      // function to get elements position
      getPosition: function (el = null) {
        if (el === null)
          return el
        else
          return {
            top: el.offsetTop,
            left: el.offsetLeft
          }
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
              location

            height = item.clientHeight
            width = item.clientWidth

            if (item.hasAttribute('data-ph-id')) {
              id = item.getAttribute('data-ph-id')
            } else {
              id = that._live.id.get()

              item.setAttribute('data-ph-id', id)
            }

            position = that._core.getPosition(item)

            location = {
              top: position.top - height - 5 + 'px',
              left: position.left + (width / 2) + 'px'
            }

            tooltip = item.getAttribute('data-ph-tooltip')
            element = that._core.createElement({
              classList: ['tooltip'],
              text: tooltip,
              style: [{top: location.top}, {left: location.left}]
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

    this._core.init.run()
  }

}

let phantom = new Phantom()

