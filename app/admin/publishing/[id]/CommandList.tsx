import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ key }: KeyboardEvent) => {
      if (key === 'ArrowUp') {
        upHandler()
        return true
      }
      if (key === 'ArrowDown') {
        downHandler()
        return true
      }
      if (key === 'Enter') {
        enterHandler()
        return true
      }
      return false
    },
  }))

  return (
    <div className="bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden py-1 w-64 text-sm z-50">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            key={index}
            className={`flex flex-col w-full text-left px-3 py-2 ${
              index === selectedIndex ? 'bg-stone-100 text-stone-900' : 'bg-transparent text-stone-700'
            }`}
            onClick={() => selectItem(index)}
          >
            <span className="font-medium">{item.title}</span>
            <span className="text-xs text-stone-500">{item.description}</span>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-stone-500">No results</div>
      )}
    </div>
  )
})

CommandList.displayName = 'CommandList'
export default CommandList