import Script from "next/script";

// Microsoft Clarity — session recordings + heatmaps for user testing
// (Ilse's request). Single project ID, no SDK init, nothing to do on
// route changes (Clarity's own script tracks SPA navigation on its own).
// Only renders when the env var is set, so a build without it just skips
// analytics instead of injecting an empty/broken script tag.
export function Clarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId) return null;

  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${projectId}");`}
    </Script>
  );
}
