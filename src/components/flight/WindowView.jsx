const WindowView = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 overflow-hidden">
      <div className="w-[320px] h-[500px] bg-slate-200 rounded-[170px] border-4 border-slate-300 relative shadow-inner overflow-hidden">
        <div className="absolute top-0 w-full h-full bg-slate-300 rounded-[160px] border-b-8 border-slate-400 shadow-lg"></div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-20 h-3 bg-slate-400 rounded-full shadow-sm"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 font-bold uppercase text-xs text-center w-48 tracking-widest opacity-50">
            Window shade closed<br/>Stay tuned Coming Soon!
        </div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
      </div>
    </div>
  );
};

export default WindowView;