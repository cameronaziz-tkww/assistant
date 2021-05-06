declare namespace Chrome {
  namespace ExtensionTypes {

    type ImageFormat = 'jpeg' | 'png';

    interface ImageDetails {
      format?: ImageFormat;
      quality?: number;
    }
  }
}