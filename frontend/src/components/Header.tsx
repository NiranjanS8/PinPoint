interface HeaderProps {
  title: string;
  description: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-copy">
        <p className="eyebrow">Structured learning organizer</p>
        <h1>{title}</h1>
        <p className="header-description">{description}</p>
      </div>
      <div className="header-badge">Phase 2</div>
    </header>
  );
}
