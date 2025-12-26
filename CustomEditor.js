import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

export default class CustomEditor extends ClassicEditorBase {}

CustomEditor.builtinPlugins = [
    Essentials,
    Paragraph,
    Bold,
    Italic,

    Image,
    ImageToolbar,
    ImageStyle,
    ImageResize,
    ImageUpload
];

CustomEditor.defaultConfig = {
    toolbar: {
        items: [
            'bold',
            'italic',
            '|',
            'imageUpload',
            '|',
            'imageStyle:alignLeft',
            'imageStyle:full',
            'imageStyle:alignRight',
        ]
    },
    image: {
        toolbar: [
            'imageStyle:alignLeft',
            'imageStyle:full',
            'imageStyle:alignRight'
        ],
        styles: ['full', 'alignLeft', 'alignRight']
    }
};
