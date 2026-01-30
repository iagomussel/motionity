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
        <img src="/assets/shape.svg" alt="" />
        <span>Shape</span>
      </button>
      <button type="button" className="toolbar-button" onClick={onAddText}>
        <img src="/assets/text.svg" alt="" />
        <span>Text</span>
      </button>
      <button type="button" className="toolbar-button" onClick={onAddImage}>
        <img src="/assets/image.svg" alt="" />
        <span>Image</span>
      </button>
      <button type="button" className="toolbar-button" onClick={onDuplicate}>
        <img src="/assets/repeat.svg" alt="" />
        <span>Duplicate</span>
      </button>
      <button type="button" className="toolbar-button danger" onClick={onDelete}>
        <img src="/assets/delete.svg" alt="" />
        <span>Delete</span>
      </button>
    </div>
  )
}

export default Toolbar
