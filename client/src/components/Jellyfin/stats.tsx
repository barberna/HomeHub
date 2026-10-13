interface StatsBarProps {
    title: string;
    stat: number;
}

export function StatsBar({ title, stat }: StatsBarProps) {
    return (
        <div className="statsbar">
            <span>{title}</span>
            <h2>{stat}</h2>
        </div>
    )
}