import type { TemplateVisualData } from '../lib/presentation';

function Illustration({ slug }: { slug: string }) {
  switch (slug) {
    case 'leave-management':
      return (
        <>
          <g transform="rotate(-9 164 112)">
            <path className="art-soft" d="M92 48h144v142H92z" />
            <rect className="art-paper art-outline" x="80" y="36" width="144" height="144" rx="8" />
            <path className="art-solid" d="M88 36h128a8 8 0 0 1 8 8v28H80V44a8 8 0 0 1 8-8" />
            <path className="art-line" d="M110 27v18m84-18v18" />
            {[0, 1, 2].map(row =>
              [0, 1, 2, 3].map(col => (
                <rect
                  key={`${row}-${col}`}
                  className={row === 1 && col > 0 ? 'art-solid' : 'art-soft'}
                  x={98 + col * 28}
                  y={88 + row * 26}
                  width="16"
                  height="14"
                  rx="3"
                />
              )),
            )}
          </g>
          <path className="art-solid" d="M243 176c-29-33-29-64 4-99 17 42 13 70-4 99" />
          <path className="art-soft art-outline" d="M244 176c-5-38 14-61 49-64-7 36-25 57-49 64" />
          <path className="art-line" d="m242 191 6-84m-5 67 34-43" />
        </>
      );
    case 'sales-crm':
      return (
        <>
          <g transform="rotate(-12 158 116)">
            <path className="art-solid" d="M89 47h131a9 9 0 0 1 9 9v133H89z" />
            <path className="art-soft art-outline" d="M82 40h126a9 9 0 0 1 9 9v130H82z" />
            <rect className="art-paper art-outline" x="70" y="32" width="134" height="140" rx="8" />
            <path className="art-line" d="M89 32v140" />
            <circle className="art-soft" cx="146" cy="82" r="24" />
            <circle className="art-solid" cx="146" cy="75" r="8" />
            <path className="art-solid" d="M130 96c0-17 32-17 32 0" />
            <path className="art-line" d="M118 122h56m-56 14h37" />
            <path className="art-solid" d="M204 58h13v23h-13zm0 32h13v23h-13z" />
          </g>
          <g transform="rotate(13 243 144)">
            <rect className="art-paper art-outline" x="196" y="111" width="103" height="66" rx="5" />
            <circle className="art-solid" cx="219" cy="134" r="8" />
            <path className="art-line" d="M237 132h43m-43 12h29m-65 17h79" />
          </g>
        </>
      );
    case 'support-desk':
      return (
        <>
          <path className="art-soft" d="M111 148V99a62 62 0 0 1 124 0v49h-18V99a44 44 0 0 0-88 0v49z" />
          <path className="art-line" d="M111 139V99a62 62 0 0 1 124 0v46" />
          <rect className="art-solid" x="99" y="106" width="31" height="53" rx="14" />
          <rect className="art-solid" x="216" y="106" width="31" height="53" rx="14" />
          <path className="art-line" d="M232 157v7c0 19-16 26-44 26" />
          <rect className="art-solid" x="170" y="182" width="26" height="13" rx="6" />
          <g transform="rotate(-7 179 110)">
            <path
              className="art-paper art-outline"
              d="M142 83h66a10 10 0 0 1 10 10v37a10 10 0 0 1-10 10h-35l-23 17v-17h-8a10 10 0 0 1-10-10V93a10 10 0 0 1 10-10"
            />
            <path className="art-line" d="M150 103h50m-50 15h34" />
          </g>
        </>
      );
    case 'marketing-content':
      return (
        <>
          <g transform="rotate(-8 163 112)">
            <path className="art-soft" d="M103 32h138v164H103z" />
            <path className="art-paper art-outline" d="M86 24h137v164H86z" />
            <path className="art-solid" d="M102 42h105v11H102z" />
            <path className="art-soft" d="M102 66h105v53H102z" />
            <path className="art-solid" d="m102 119 35-37 23 22 17-17 30 32z" />
            <circle className="art-paper" cx="185" cy="80" r="7" />
            <path className="art-line" d="M102 136h45m16 0h44m-105 13h45m16 0h44m-105 13h45m16 0h30" />
          </g>
          <g transform="rotate(28 247 113)">
            <path className="art-solid" d="M237 49h20v115h-20z" />
            <path className="art-paper art-outline" d="m237 164 10 25 10-25z" />
            <path className="art-line" d="M247 60v96" />
            <path className="art-soft art-outline" d="M237 49V38a10 10 0 0 1 20 0v11z" />
          </g>
        </>
      );
    case 'product-backlog':
      return (
        <>
          <g transform="rotate(-13 161 108)">
            <path className="art-soft art-outline" d="M77 62h152v112H77z" />
            <path className="art-paper art-outline" d="M89 43h152v112H89z" />
            <path className="art-solid" d="M101 25h152v112H101z" />
            <path className="art-paper" d="M120 45h61v7h-61zm0 19h107v3H120zm0 13h83v3h-83z" />
            <path className="art-paper" d="M120 101h9v9h-9zm19 0h9v9h-9zm19 0h9v9h-9z" />
          </g>
          <path
            className="art-paper art-outline"
            d="M209 120h64a12 12 0 0 1 12 12v30a12 12 0 0 1-12 12h-23l-17 17v-17h-24a12 12 0 0 1-12-12v-30a12 12 0 0 1 12-12"
          />
          <path className="art-line" d="M215 138h51m-51 16h33" />
        </>
      );
    default:
      return (
        <>
          <path className="art-soft art-outline" d="m60 147 47-24 47 24-47 24z" />
          <path className="art-paper art-outline" d="m60 147 47 24v29l-47-24z" />
          <path className="art-solid" d="m107 171 47-24v29l-47 24z" />
          <path className="art-soft art-outline" d="m127 111 47-24 47 24-47 24z" />
          <path className="art-paper art-outline" d="m127 111 47 24v65l-47-24z" />
          <path className="art-solid" d="m174 135 47-24v65l-47 24z" />
          <path className="art-soft art-outline" d="m194 75 47-24 47 24-47 24z" />
          <path className="art-paper art-outline" d="m194 75 47 24v101l-47-24z" />
          <path className="art-solid" d="m241 99 47-24v101l-47 24z" />
          <path className="art-line" d="M241 76V17" />
          <path className="art-paper art-outline" d="M242 18h39l-9 13 9 13h-39z" />
        </>
      );
  }
}

export default function TemplateArtwork({ slug, data }: { slug: string; data: TemplateVisualData }) {
  return (
    <figure className="template-artwork" data-template={slug} aria-label={`${data.title} field preview`}>
      <svg viewBox="0 0 360 224" fill="none" aria-hidden="true" focusable="false">
        <Illustration slug={slug} />
      </svg>
      <figcaption>
        <span>Fields</span>
        <span>{data.fields.slice(0, 2).join(' · ')}</span>
      </figcaption>
    </figure>
  );
}
