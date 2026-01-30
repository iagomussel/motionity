import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Text, Transformer, Circle, Image as KonvaImage } from 'react-konva'

function useSize(ref) {
  const [size, setSize] = useState({ width: 800, height: 500 })

  useEffect(() => {
    if (!ref.current) return undefined
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  return size
}

function useImage(source) {
  const [image, setImage] = useState(null)

  useEffect(() => {
    if (!source) {
      setImage(null)
      return undefined
    }
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = source
    const handleLoad = () => setImage(img)
    img.addEventListener('load', handleLoad)
    return () => {
      img.removeEventListener('load', handleLoad)
    }
  }, [source])

  return image
}

function ImageNode({ obj, onSelect, onChange, registerRef }) {
  const image = useImage(obj.src)
  const cropWidth = obj.cropWidth ?? obj.width
  const cropHeight = obj.cropHeight ?? obj.height

  return (
    <KonvaImage
      ref={registerRef}
      image={image}
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      rotation={obj.rotation}
      opacity={obj.opacity ?? 1}
      crop={{
        x: obj.cropX ?? 0,
        y: obj.cropY ?? 0,
        width: cropWidth,
        height: cropHeight
      }}
      visible={obj.visible}
      draggable
      onClick={() => onSelect(obj.id)}
      onTap={() => onSelect(obj.id)}
      onDragEnd={(e) => {
        onChange(obj.id, { x: e.target.x(), y: e.target.y() })
      }}
      onTransformEnd={(e) => {
        const node = e.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        onChange(obj.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(40, node.width() * scaleX),
          height: Math.max(40, node.height() * scaleY),
          rotation: node.rotation()
        })
      }}
    />
  )
}

function CanvasStage({ objects, selectedId, onSelect, onChange, onDropAsset }) {
  const containerRef = useRef(null)
  const transformerRef = useRef(null)
  const stageRef = useRef(null)
  const shapeRefs = useRef({})
  const { width, height } = useSize(containerRef)

  useEffect(() => {
    const transformer = transformerRef.current
    const selectedNode = shapeRefs.current[selectedId]
    if (transformer && selectedNode) {
      transformer.nodes([selectedNode])
      transformer.getLayer()?.batchDraw()
    } else if (transformer) {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
    }
  }, [selectedId, objects])

  return (
    <div
      className="canvas-stage"
      ref={containerRef}
      onDragOver={(event) => {
        event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        if (!onDropAsset) return
        const data = event.dataTransfer.getData('application/motionity-asset')
        if (!data) return
        const asset = JSON.parse(data)
        const stage = stageRef.current?.getStage()
        if (!stage) return
        stage.setPointersPositions(event)
        const pos = stage.getPointerPosition()
        if (!pos) return
        onDropAsset(asset, pos)
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            onSelect(null)
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) {
            onSelect(null)
          }
        }}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#0B1220"
          />
          {objects.map((obj) => {
            if (obj.type === 'image') {
              return (
                <ImageNode
                  key={obj.id}
                  obj={obj}
                  onSelect={onSelect}
                  onChange={onChange}
                  registerRef={(node) => {
                    if (node) shapeRefs.current[obj.id] = node
                  }}
                />
              )
            }
            if (obj.type === 'text') {
              return (
                <Text
                  key={obj.id}
                  ref={(node) => {
                    if (node) shapeRefs.current[obj.id] = node
                  }}
                  text={obj.text}
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  fontSize={obj.fontSize}
                  fill={obj.fill}
                  opacity={obj.opacity ?? 1}
                  draggable
                  rotation={obj.rotation}
                  visible={obj.visible}
                  onClick={() => onSelect(obj.id)}
                  onTap={() => onSelect(obj.id)}
                  onDragEnd={(e) => {
                    onChange(obj.id, { x: e.target.x(), y: e.target.y() })
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target
                    const scaleX = node.scaleX()
                    const scaleY = node.scaleY()
                    node.scaleX(1)
                    node.scaleY(1)
                    onChange(obj.id, {
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(40, node.width() * scaleX),
                      fontSize: Math.max(8, obj.fontSize * scaleY),
                      rotation: node.rotation()
                    })
                  }}
                />
              )
            }
            if (obj.type === 'circle') {
              return (
                <Circle
                  key={obj.id}
                  ref={(node) => {
                    if (node) shapeRefs.current[obj.id] = node
                  }}
                  x={obj.x}
                  y={obj.y}
                  radius={obj.radius}
                  fill={obj.fill}
                  opacity={obj.opacity ?? 1}
                  draggable
                  rotation={obj.rotation}
                  visible={obj.visible}
                  onClick={() => onSelect(obj.id)}
                  onTap={() => onSelect(obj.id)}
                  onDragEnd={(e) => {
                    onChange(obj.id, { x: e.target.x(), y: e.target.y() })
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target
                    const scaleX = node.scaleX()
                    const scaleY = node.scaleY()
                    node.scaleX(1)
                    node.scaleY(1)
                    const nextRadius = Math.max(
                      10,
                      node.radius() * Math.max(scaleX, scaleY)
                    )
                    onChange(obj.id, {
                      x: node.x(),
                      y: node.y(),
                      radius: nextRadius,
                      rotation: node.rotation()
                    })
                  }}
                />
              )
            }
            return (
                <Rect
                  key={obj.id}
                  ref={(node) => {
                    if (node) shapeRefs.current[obj.id] = node
                  }}
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  height={obj.height}
                  fill={obj.fill}
                  opacity={obj.opacity ?? 1}
                  draggable
                  rotation={obj.rotation}
                  cornerRadius={8}
                  visible={obj.visible}
                  onClick={() => onSelect(obj.id)}
                  onTap={() => onSelect(obj.id)}
                  onDragEnd={(e) => {
                    onChange(obj.id, { x: e.target.x(), y: e.target.y() })
                  }}
                onTransformEnd={(e) => {
                  const node = e.target
                  const scaleX = node.scaleX()
                  const scaleY = node.scaleY()
                  node.scaleX(1)
                  node.scaleY(1)
                  onChange(obj.id, {
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(20, node.width() * scaleX),
                    height: Math.max(20, node.height() * scaleY),
                    rotation: node.rotation()
                  })
                }}
              />
            )
          })}
          <Transformer
            ref={transformerRef}
            rotateEnabled
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 20 || newBox.height < 20) {
                return oldBox
              }
              return newBox
            }}
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default CanvasStage
