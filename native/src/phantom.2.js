let Phantom = function () {
  /*
  * Phantom object
  *
  * */

  let phantom = []

  switch (true) {
    // If argument is DOMElement
    case arguments[0] instanceof HTMLElement:
      phantom.push(arguments[0])
      break
    // If argument is array of DOMElements or phantom object
    case arguments[0] instanceof Array && arguments[0][0] instanceof HTMLElement:
      arguments[0].forEach(function (value, index, array) {
        phantom.push(value)
      })
      break
    // If argument is NodeList
    case arguments[0] instanceof NodeList:
      for (let i = 0; i < arguments[0]; i++)
        phantom.push(arguments[0][i])
      break
    // Default is querySelector
    default:
      let list = document.querySelectorAll(arguments[0])

      for (let i = 0; i < list.length; i++)
        phantom.push(list[i])
      break
  }

  /*
  * Binding our modules
  *
  * */
  Phantom._module.list.forEach(function (value, key, map) {
    phantom[key] = value.bind(phantom)
  })

  return phantom
}

let ph = Phantom

/*
* Setting is a global variables that we keep our setting of framework here
*
*
* */

Phantom._setting = {
  log: false
}


/*
* Engine is a section that we can add callbacks to it so it will gets called when DOMContentLoaded is fired
*
* */

Phantom._engine = {
  add: function (name, callback) {
    this.list.set(name, callback)
  },
  remove: function (name) {
    this.list.delete(name)
  },
  get: function (name) {
    return this.list.get(name)
  },
  list: new Map(),
  start: function () {
    this.list.forEach(function (value, key, map) {
      if (Phantom._setting.log)
        console.log('initializing ' + key)

      value()

      if (Phantom._setting.log)
        console.log('Finished' + key)
    })
  }
}

document.addEventListener('DOMContentLoaded', function () {
  Phantom._engine.start()
})

/*
* Building our live section to keep our live values
*
* */

Phantom._live = {
  getId: function () {
    return this.counter++
  },
  counter: 0,
  list: new Map(),
  add: function (key, value) {
    this.list.set(key, value)
  },
  remove: function (key) {
    this.list.delete(key)
  },
  get: function (key) {
    return this.list.get(key)
  }
}

/*
* Building a module section so we can import and export modules to our framework
*
* */
Phantom._module = {
  export: function ({ name } = {}) {
    let item = this.list.get(name)

    this.list.delete(name)

    return {
      name,
      callback: item
    }
  },
  import: function ({ name, callback} = {}) {
    this.list.set(name, callback)
  },
  list: new Map()
}

/*
* To get element class list by array
*
* */
ph._module.import({
  name: 'getClassArray',
  callback: function () {
    let classList = []

    this.forEach(function (value, index, array) {
      if (value.className.length > 0)
        value.className.split(' ').forEach(function (value2, index2, array2) {
          if (classList.indexOf(value2) === -1)
            classList.push(value2)
        })
    })

    return classList
  }
})

/*
* To add class to one element or multi elements, accepts single string or array of strings
*
* */
ph._module.import({
  name: 'addClass',
  callback: function () {
    let list = []

    switch (true) {
      case  arguments[0] instanceof Array:
        arguments[0].forEach(function (value, index, array) {
          list.push(value)
        })
        break
      default:
        list.push(arguments[0])
        break
    }

    this.forEach(function (value, index, array) {
      let classList = ph(value).getClassArray()

      list.forEach(function (value2, index2, array2) {
        if (classList.indexOf(value2) === -1)
          classList.push(value2)
      })

      value.className = classList.join(' ')
    })
  }
})

/*
* To remove class from one element or multi elements, accepts single string or array of strings
*
* */
ph._module.import({
  name: 'removeClass',
  callback: function () {
    let list = []

    switch (true) {
      case  arguments[0] instanceof Array:
        arguments[0].forEach(function (value, index, array) {
          list.push(value)
        })
        break
      default:
        list.push(arguments[0])
        break
    }

    this.forEach(function (value, index, array) {
      let classList = ph(value).getClassArray()

      list.forEach(function (value2, index2, array2) {
        if (classList.indexOf(value2) > -1)
          classList.splice(classList.indexOf(value2), 1)
      })

      value.className = classList.join(' ')
    })
  }
})

/*
* To toggle (add or remove) class on one element or multi elements, accepts single string or array of strings
*
* */
ph._module.import({
  name: 'toggle',
  callback: function () {
    let list = []

    switch (true) {
      case  arguments[0] instanceof Array:
        arguments[0].forEach(function (value, index, array) {
          list.push(value)
        })
        break
      default:
        list.push(arguments[0])
        break
    }

    this.forEach(function (value, index, array) {
      let classList = ph(value).getClassArray()

      list.forEach(function (value2, index2, array2) {
        if (classList.indexOf(value2) > -1)
          ph(value).removeClass(value2)
        else
          ph(value).addClass(value2)
      })
    })
  }
})

ph._module.import({
  name: 'getViewportOffset',
  callback: function () {
    /*TODO: build an array on export in case received more than one element on the query*/
    // this.forEach(function (value, index, array) {
      let node = this[0]
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
    // })
  }
})

/*
* Tooltip
*
*   you can access it by adding following attribute [data-ph-tooltip] for the tooltip text and
*   [data-ph-pos] = [top|bottom|right|left|undefined] for tooltip location
*
* */
ph._module.import({
  name: 'tooltip',
  callback: function () {
    this.forEach(function (value, index, array) {
      value.addEventListener('mouseover', function (event) {
        let tooltip,
          position,
          element,
          id,
          height,
          width,
          location,
          direction = value.getAttribute('data-ph-pos') ?  value.getAttribute('data-ph-pos') : 'top'


        height = value.clientHeight
        width = value.clientWidth

        if (value.hasAttribute('data-ph-id'))
          id = value.getAttribute('data-ph-id')
        else {
          id = ph._live.getId()

          value.setAttribute('data-ph-id', id)
        }

        position = ph(value).getViewportOffset()

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

        tooltip = value.getAttribute('data-ph-tooltip')

        element = document.createElement('div')
        ph(element).addClass(['tooltip', direction])
        element.appendChild(document.createTextNode(tooltip))

        element.style.top = location.top

        if (location.left)
          element.style.left = location.left

        if (location.right)
          element.style.right = location.right

        ph._live.add(id.toString(), element)

        document.body.appendChild(element)
      })

      value.addEventListener('mouseleave', function(event) {
        let id = event.target.getAttribute('data-ph-id'),
          element

        element = ph._live.get(id)

        element.remove()

        ph._live.remove(id)
      }, false)
    })
  }
})

ph._engine.add('tooltip', function () {
  ph('[data-ph-tooltip]').tooltip()
})

/*
* Carousel is function to manage some adding and removing class by timer
*
* */
ph._module.import({
  name: 'carousel',
  callback: function () {

  }
})

/*
* Dropdown is just a toggle class
*
* */
ph._module.import({
  name: 'dropdown',
  callback: function () {

  }
})

/*
* Modal also is toggling a class on the modal target
*
* */
ph._module.import({
  name: 'modal',
  callback: function () {

  }
})
