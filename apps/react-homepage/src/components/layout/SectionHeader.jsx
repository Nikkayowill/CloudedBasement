export default function SectionHeader({ kicker, heading, body }) {
  return (
    <div className="text-center mb-16 reveal">
      {kicker && <p className="funnel-kicker mb-4">{kicker}</p>}
      <h2 className="funnel-heading-2 mb-5">{heading}</h2>
      {body && (
        <p
          className="funnel-body"
          style={{ maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {body}
        </p>
      )}
    </div>
  );
}
