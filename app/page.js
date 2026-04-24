"use client";

import { useState } from "react";
import { 
  Network, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  CornerDownRight, 
  RefreshCcw, 
  TreePine, 
  AlertTriangle 
} from "lucide-react";

const TreeRenderer = ({ tree, level = 0 }) => {
  const keys = Object.keys(tree).sort();
  if (keys.length === 0) return null;

  return (
    <div className="flex flex-col ml-4 mt-2">
      {keys.map((key) => (
        <div key={key} className="flex flex-1 flex-col node-item" style={{ animationDelay: `${level * 100}ms` }}>
          <div className="flex items-center text-sm font-medium text-gray-200 py-1">
            <CornerDownRight className="w-4 h-4 text-primary mr-2 opacity-60" />
            <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-md mb-1 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
              {key}
            </div>
          </div>
          {Object.keys(tree[key]).length > 0 && (
            <div className="border-l border-primary/20 ml-[9px] pl-4">
               <TreeRenderer tree={tree[key]} level={level + 1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


export default function Home() {
  const [inputVal, setInputVal] = useState('["A->B", "A->C", "B->D", "C->E", "E->F"]');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    let parsedData = [];
    try {
      const rawVal = inputVal.trim();
      // If it looks like a raw list without brackets, try to wrap it
      if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
        parsedData = JSON.parse(rawVal);
      } else {
        // Assume CSV string input like "A->B", "A->C"
        parsedData = JSON.parse(`[${rawVal}]`);
      }
    } catch (err) {
      setError("Invalid JSON format. Please ensure you provide a valid array of strings, e.g. [\"A->B\", \"A->C\"]");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/bfhl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: parsedData }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to fetch response from API");
      }
      setResult(json);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
      
      {/* Header */}
      <header className="mb-12 text-center flex flex-col items-center">
        <div className="inline-flex items-center justify-center p-3 glass rounded-2xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
           <Network className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          BFHL Challenge
        </h1>
        <p className="text-gray-400 text-lg max-w-xl text-center">
          Enter your JSON array of nodes to build the hierarchy.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Form */}
        <section className="glass-card p-6 md:p-8 relative overflow-hidden flex flex-col h-fit">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
          
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            Input Matrix
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            <label className="text-sm text-gray-400 mb-2 font-medium" htmlFor="nodes">
              JSON Array sequence
            </label>
            <textarea 
              id="nodes"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full rounded-xl p-4 text-base font-mono text-white bg-slate-900/80 border border-slate-700 outline-none focus:border-primary/50 transition-colors h-48 resize-none mb-6"
              placeholder='["A->B", "A->C", "B->D"]'
              spellCheck={false}
            />

            <button 
              type="submit" 
              disabled={loading}
              className="mt-auto w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            >
              {loading ? (
                <>
                  <RefreshCcw className="w-5 h-5 mr-2 animate-spin" /> Processing Matrix...
                </>
              ) : (
                <>
                   Submit
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>

        {/* Right Column - Results */}
        <section className="glass-card p-6 md:p-8 min-h-[500px]">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
             Computation Output
          </h2>

          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-gray-500 min-h-[300px]">
                <Network className="w-12 h-12 mb-4 opacity-20" />
                <p>Awaiting input...</p>
             </div>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center h-full text-primary min-h-[300px]">
                 <RefreshCcw className="w-10 h-10 animate-spin mb-4" />
                 <p className="animate-pulse">Loading...</p>
             </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               {/* Summary Badges */}
               <div className="flex flex-wrap gap-2 mb-6 text-sm">
                  <div className="px-3 py-1.5 glass rounded-full flex items-center border-green-500/30 text-green-300">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Success
                  </div>
                  <div className="px-3 py-1.5 glass rounded-full flex items-center font-mono text-gray-300">
                     Trees: <span className="text-white ml-2">{result.summary.total_trees}</span>
                  </div>
                  <div className="px-3 py-1.5 glass rounded-full flex items-center font-mono text-gray-300 border-orange-500/30">
                     Cycles: <span className="text-orange-400 ml-2">{result.summary.total_cycles}</span>
                  </div>
               </div>

               <div className="text-xs text-gray-500 mb-6 font-mono bg-black/30 p-3 rounded-lg border border-white/5">
                 <p><span className="text-primary w-24 inline-block">User ID:</span> {result.user_id}</p>
                 <p><span className="text-primary w-24 inline-block">Email:</span> {result.email_id}</p>
                 <p><span className="text-primary w-24 inline-block">Roll No:</span> {result.college_roll_number}</p>
               </div>

               <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold border-b border-white/10 pb-2">Hierarchies</h3>
                  {result.hierarchies.length === 0 ? (
                    <p className="text-sm text-gray-500">No valid hierarchies generated.</p>
                  ) : (
                    <div className="space-y-4">
                      {result.hierarchies.map((h, i) => (
                         <div key={i} className="glass p-4 rounded-xl border border-white/5">
                           <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center text-lg font-bold text-white">
                                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 text-sm ring-1 ring-primary/30">
                                   {h.root}
                                </span>
                                Root Component
                             </div>
                             {h.has_cycle ? (
                                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-md font-medium flex items-center">
                                   <AlertTriangle className="w-3 h-3 mr-1" /> Cycle Detected
                                </span>
                             ) : (
                                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                                   Depth: {h.depth}
                                </span>
                             )}
                           </div>
                           
                           {/* Tree Visualization */}
                           <div className="mt-4 pt-4 border-t border-white/5 overflow-x-auto">
                              {h.has_cycle ? (
                                <p className="text-sm text-gray-400 italic flex items-center">Cycle structures cannot be resolved to a tree.</p>
                              ) : (
                                Object.keys(h.tree).length > 0 ? (
                                  <TreeRenderer tree={h.tree} />
                                ) : (
                                  <p className="text-sm text-gray-400 italic">No nested branches.</p>
                                )
                              )}
                           </div>
                         </div>
                      ))}
                    </div>
                  )}
               </div>

               {/* Edge Case Reporting */}
               {(result.invalid_entries?.length > 0 || result.duplicate_edges?.length > 0) && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                   {result.invalid_entries?.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <h4 className="text-red-400 text-xs uppercase font-bold tracking-wider mb-2">Invalid Entries</h4>
                        <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-400">
                          {result.invalid_entries.map((inv, idx) => (
                             <span key={idx} className="bg-black/40 px-2 py-1 rounded">"{inv}"</span>
                          ))}
                        </div>
                      </div>
                   )}
                   {result.duplicate_edges?.length > 0 && (
                      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                        <h4 className="text-orange-400 text-xs uppercase font-bold tracking-wider mb-2">Duplicate Edges</h4>
                        <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-400">
                          {result.duplicate_edges.map((dup, idx) => (
                             <span key={idx} className="bg-black/40 px-2 py-1 rounded">"{dup}"</span>
                          ))}
                        </div>
                      </div>
                   )}
                 </div>
               )}

            </div>
          )}
        </section>
      </div>

    </main>
  );
}
