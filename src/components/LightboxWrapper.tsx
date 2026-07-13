'use client';

import Lightbox, { LightboxExternalProps } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export default function LightboxWrapper(props: LightboxExternalProps) {
  return (
    <Lightbox 
      plugins={[Zoom]} 
      zoom={{ maxZoomPixelRatio: 5 }} 
      {...props} 
    />
  );
}
