import type { NativeScene } from '@/lib/content/evolve';

export function RuleSign({symbol}:{symbol:Extract<NativeScene,{kind:'rule_sign'}>['symbol']}) {
  const prohibited=symbol.startsWith('no_'),labels={no_phone:'Mobile phone crossed out',no_ball:'Football crossed out',no_touch:'Hand touching an object crossed out',no_entry:'Red circle with a horizontal white bar',stop:'Red octagonal STOP sign',shoes:'Remove shoes instruction',belt:'Fasten seatbelt instruction',bin:'Put litter in a bin instruction'};
  return <figure dir="ltr" className="mx-auto mb-3 w-full max-w-48 rounded-2xl bg-secondary/30 p-2"><svg viewBox="0 0 200 180" role="img" aria-label={`Practice sign: ${labels[symbol]}`} className="w-full rounded-xl bg-card">
    {prohibited&&<circle cx="100" cy="90" r="66" fill={symbol==='no_entry'?'#be403d':'#fff'} stroke="#be403d" strokeWidth="12"/>}
    {symbol==='no_phone'&&<g fill="none" stroke="#253d4b" strokeWidth="6"><rect x="77" y="49" width="46" height="83" rx="6"/><path d="M78 65H122M78 117H122"/><circle cx="100" cy="125" r="2"/></g>}
    {symbol==='no_ball'&&<g stroke="#253d4b" strokeWidth="4"><circle cx="100" cy="90" r="34" fill="#fff"/><path d="M100 70L119 83L112 105H88L81 83Z" fill="#253d4b"/><path d="M100 56V70M68 79L81 83M79 119L88 105M122 118L112 105M132 79L119 83"/></g>}
    {symbol==='no_touch'&&<g fill="none" stroke="#253d4b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M74 113V82Q74 76 80 78L89 86V52Q89 43 97 49V77V46Q97 39 105 45V78V51Q105 45 113 51V80V60Q113 53 120 59V100Q119 121 108 128H90Z"/><path d="M126 106H143V130H124"/></g>}
    {symbol==='no_entry'&&<rect x="53" y="79" width="94" height="22" rx="3" fill="#fff"/>}
    {prohibited&&symbol!=='no_entry'&&<path d="M54 44L146 136" stroke="#be403d" strokeWidth="12"/>}
    {symbol==='stop'&&<><path d="M69 20H131L170 59V121L131 160H69L30 121V59Z" fill="#be403d"/><path d="M73 29H127L161 63V117L127 151H73L39 117V63Z" fill="none" stroke="#fff" strokeWidth="3"/><text x="100" y="103" textAnchor="middle" fill="#fff" fontSize="35" fontWeight="bold">STOP</text></>}
    {['shoes','belt','bin'].includes(symbol)&&<circle cx="100" cy="90" r="69" fill="#246caa"/>}
    {symbol==='shoes'&&<><g fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round"><path d="M55 107L66 75L88 85L104 106L137 114V130H54Z"/><path d="M110 58H145M133 47L147 58L133 69"/></g><text x="100" y="151" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">SHOES OFF</text></>}
    {symbol==='belt'&&<g fill="none" stroke="#fff" strokeWidth="6"><circle cx="100" cy="51" r="15" fill="#fff"/><path d="M100 75V118M80 80L74 115M120 80L126 115M100 118L80 143M100 118L120 143M68 85L128 130"/><path d="M75 118H126" strokeWidth="9"/></g>}
    {symbol==='bin'&&<g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"><circle cx="75" cy="51" r="11" fill="#fff"/><path d="M75 68V107L60 137M75 107L88 137M76 80L104 88M115 100L120 137H144L149 100ZM113 98H151"/><path d="M108 82L114 88" strokeWidth="8"/></g>}
  </svg></figure>;
}
