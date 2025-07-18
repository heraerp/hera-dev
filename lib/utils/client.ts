/**
 * Client-side utilities that safely handle window object
 */

export const isClient = typeof window !== "undefined" && typeof document !== "undefined"

export const safeWindow = {
  get innerWidth() {
    return isClient ? window.innerWidth : 1920
  },
  get innerHeight() {
    return isClient ? window.innerHeight : 1080
  },
  location: {
    href: "",
    assign: (url: string) => {
      if (isClient) {
        window.location.assign(url)
      }
    },
    reload: () => {
      if (isClient) {
        window.location.reload()
      }
    }
  }
}

export const navigate = (url: string) => {
  if (isClient) {
    window.location.href = url
  }
}

export const getWindowDimensions = () => ({
  width: isClient ? window.innerWidth : 1920,
  height: isClient ? window.innerHeight : 1080
})

// Safe document access
export const safeDocument = {
  getElementById: (id: string) => {
    return isClient ? document.getElementById(id) : null
  },
  querySelector: (selector: string) => {
    return isClient ? document.querySelector(selector) : null
  },
  querySelectorAll: (selector: string) => {
    return isClient ? document.querySelectorAll(selector) : []
  }
}