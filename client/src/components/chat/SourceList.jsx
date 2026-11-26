function SourceList({ sources}){
    return(
        <div className="mt-3 border-t pt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Sources</p>
            <ul className="space-y-1">
                {sources.map((source)=>(
                    <li key={source.id} className="text-xs">
                        <details>
                            <summary className="cursor-pointer text-muted-foreground">
                                [{source.id}] {source.title},page {source.page}
                            </summary>
                            <p className="mt-1 p-2 rounded bg-background text-muted-foreground">{source.text}</p>
                        </details>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default SourceList;