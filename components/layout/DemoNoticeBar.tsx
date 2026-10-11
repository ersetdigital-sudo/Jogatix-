/** Amber "MODE DEMO" strip shown on the informational pages. */
export function DemoNoticeBar({ message }: { message: string }) {
  return (
    <div className="demo-notification-bar">
      <span className="demo-tag">MODE DEMO</span>
      <span>{message}</span>
    </div>
  );
}
