class Phantom  {
  constructor () {
    //setting up access to the Phantom Object
    let that = this

    // Setting up our core which will be used in all different places such as in JS Native, jQuery and ...
    this.__proto__._core = {
      // function to get elements position
      getPosition: function ({ el = null }) {
        if (el === null)
          return el
        else
          return {
            top: el.offsetTop,
            left: el.offsetLeft
          }
      },
      // function to make elements fast
      createElement: function ({ type = 'DIV', classList = [], children = [], text = '' }) {
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
        list: new Map()
      }
    }

    this.__proto__._native = {

    }
  }

}

let phantom = new Phantom('salam')

