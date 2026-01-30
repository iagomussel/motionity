function Toolbar({
  onAddRect,
  onAddText,
  onAddImage,
  onDuplicate,
  onDelete
}) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Editor tools">
      <button type="button" className="toolbar-button" onClick={onAddRect}>
        Shape
      </button>
      <button type="button" className="toolbar-button" onClick={onAddText}>
        Text
      </button>
      <button type="button" className="toolbar-button" onClick={onAddImage}>
        Image
      </button>
      <button type="button" className="toolbar-button" onClick={onDuplicate}>
        Duplicate
      </button>
      <button type="button" className="toolbar-button danger" onClick={onDelete}>
        Delete
      </button>
    </div>
  )
}

export default Toolbar
