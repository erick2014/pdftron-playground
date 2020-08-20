import React from 'react';
import { useEffect, useRef } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';
import { loadXfdfString, saveXfdfString } from './utils.js'

const drawSquareInViewer = ({ Annotations, annotManager }) => {
  // Add customization here
  // Draw rectangle annotation on first page
  const rectangle = new Annotations.RectangleAnnotation();
  rectangle.PageNumber = 1;
  rectangle.X = 100;
  rectangle.Y = 100;
  rectangle.Width = 250;
  rectangle.Height = 250;
  rectangle.Author = 'erick armando garcia'
  annotManager.addAnnotation(rectangle);
  annotManager.drawAnnotations(rectangle.PageNumber);
}

const drawImageOnPdf = async ({ PDFNet, docViewer }) => {
  // this shou
  await PDFNet.initialize();
  const doc = docViewer.getDocument();
  const pdfDoc = await doc.getPDFDoc();
  const firstPage = await pdfDoc.getPage(1);
  // create a new page builder that allows us to create new page elements
  const builder = await PDFNet.ElementBuilder.create();
  // create a new page writer that allows us to add/change page elements
  const writer = await PDFNet.ElementWriter.create();
  writer.beginOnPage(firstPage, PDFNet.ElementWriter.WriteMode.e_overlay);
  // Refresh the cache with the newly updated document

  const img = await PDFNet.Image.createFromURL(pdfDoc, 'https://images-na.ssl-images-amazon.com/images/I/51%2B3jl01JfL._AC_.jpg');
  const element = await builder.createImageScaled(img, 100, 600, 100, 100);
  // Refresh the cache with the newly updated document
  writer.writePlacedElement(element);
  writer.end();

  docViewer.refreshAll();
  // Update viewer with new document
  docViewer.updateView();
}

function App () {

  const viewer = useRef(null)
  useEffect(() => {
    const getViewerInstance = async () => {
      const instance = await WebViewer(
        {
          enableAnnotations: true,
          path: '/lib',
          initialDoc: '/files/pdftron_about.pdf',
          fullAPI: true,
          licenseKey: 'add-license-key'
        },
        viewer.current
      )

      const { docViewer, annotManager, Annotations, PDFNet } = instance
      instance.disableElements(['searchButton']);
      instance.setTheme('dark');
      instance.setHeaderItems(function (header) {
        header.push({
          type: 'actionButton',
          img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
          onClick: function () {
            annotManager.exportAnnotations({ links: false, widgets: false })
              .then(function (xfdfString) {
                saveXfdfString('webviewer-demo-1', xfdfString).then(function () {
                  alert('Annotations saved successfully.');
                })
              })
          }
        });
      })

      docViewer.on('documentLoaded', async () => {
        const annotationsAsString = await loadXfdfString('webviewer-demo-1')
        const annotations = await annotManager.importAnnotations(annotationsAsString)
        annotManager.drawAnnotationsFromList(annotations)
        await drawImageOnPdf({ PDFNet, docViewer })
      })

      docViewer.on('fitModeUpdated', fitMode => {
        console.log('fit mode changed');
      })
    }
    getViewerInstance()

  }, []);
  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="MyComponent">
        <div className="webviewer" ref={viewer} style={{ height: "100vh" }}></div>
      </div>
    </div>
  );
}

export default App;
