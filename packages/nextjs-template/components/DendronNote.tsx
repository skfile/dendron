import { useEffect, useRef } from "react";

export const DendronNote = ({ noteContent }: { noteContent: string }) => {
  useEffect(() => {
    if (window) {
      const iframes = window.document.getElementsByTagName("iframe");
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < iframes.length; i++) {
        console.log("iframe deteced");
        const iframe = iframes[i];
        iframe.style.width = "100%";
        iframe.addEventListener("load", () => {
          // does not work over resize will fix later.
          iframe.style.height =
            iframe.contentWindow?.document.body.scrollHeight + "px";
        });
        // to fix weird loading issue since the rehydration might happen after the iframe is loaded.
        iframe.dispatchEvent(new Event("load"));
      }
    }
  }, [noteContent]);
  return <div dangerouslySetInnerHTML={{ __html: noteContent }} />;
};

export default DendronNote;
