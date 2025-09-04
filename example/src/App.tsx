/**
 * JustdialOCR SDK Complete Architecture Test App
 * Tests the full flow: React Native App → JustdialOCR SDK → [Camera/Gallery → ML Kit → Firebase AI] → OCR Results
 *
 * @format
 */

import React from 'react';
import OCRTestApp from './OCRTestApp';

// Use our comprehensive OCR test component as the main app
const App = (): JSX.Element => {
  return <OCRTestApp />;
};

export default App;
