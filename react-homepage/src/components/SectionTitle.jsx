export default function SectionTitle({ text1, text2, text3 }) {
  return (
    <div className="text-center mb-16 reveal">
      {text1 && <p className="funnel-kicker mb-4">{text1}</p>}
      <h2 className="funnel-heading-2 mb-5">{text2}</h2>
      {text3 && (
        <p
          className="funnel-body"
          style={{ maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {text3}
        </p>
      )}
    </div>
  );
}
