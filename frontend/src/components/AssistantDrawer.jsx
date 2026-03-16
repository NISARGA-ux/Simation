export default function AssistantDrawer({ open, onClose, messages=[] }) {
  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform ${open?'translate-x-0':'translate-x-full'} transition-transform duration-300`}>
      <div className="p-4 border-b flex justify-between">
        <h3 className="font-semibold">Zenith Assistant</h3>
        <button onClick={onClose}>✖</button>
      </div>
      <div className="p-4 space-y-3 overflow-auto h-[calc(100%-56px)]">
        {messages.map((m,i)=>(
          <div key={i} className={`p-3 rounded-xl ${m.role==='ai'?'bg-gray-100':'bg-gray-900 text-white'}`}>{m.text}</div>
        ))}
      </div>
    </div>
  );
}
