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

let ph = Phantom

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

  }
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
