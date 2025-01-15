import React from 'react';
import { Controller } from 'react-hook-form';
import { Editor } from '@tinymce/tinymce-react';

const RTE = ({
    name, control, label, defaultValue = ""
}) => {
  return (
    <div className='w-full'>
      {label && (
        <label className='inline-block mb-1 pl-1'>{label}</label>
      )}
      <Controller
        name={name || "content"}
        control={control}
        render={({ field: { onChange } }) => (
          <Editor
            apiKey='8vwp99knvkls3mdvmlood29xox8er4s1e03oo669xrvxkthd'
            initialValue={defaultValue}
            init={{
              branding: false,
              height: 500,
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                       'bold italic forecolor | alignleft aligncenter ' +
                       'alignright alignjustify | bullist numlist outdent indent | ' +
                       'removeformat | help' +'pastetext',
              paste_as_text: true, //change this to false if you have power paste enabled to stop merging tags

              content_style: `
                body { 
                  background-color: #1e1e1e; /* Dark background */
                  color: white; /* White text */
                  font-family: Helvetica, Arial, sans-serif; 
                  font-size: 14px; 
                } 
                h1, h2, h3, h4, h5, h6 {
                  color: white; /* White headers */
                }
                a { 
                  color: #1e90ff; /* Link color */
                }
                /* Additional styles to improve visibility */
                p, li { 
                  line-height: 1.5; 
                }
              `,
              toolbar_style: `
                background-color: #2a2a2a; /* Dark toolbar background */
                color: white; /* White toolbar text */
              `
            }}
            onEditorChange={onChange}
          />
        )}
      />
    </div>
  );
}

export default RTE;
