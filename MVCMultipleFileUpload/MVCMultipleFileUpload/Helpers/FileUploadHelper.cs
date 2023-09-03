using MVCMultipleFileUpload.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MVCMultipleFileUpload.Helpers
{
    public class FileUploadHelper
    {
        public UploadedFile GetFileFromRequest(HttpRequestBase Request)
        {
            string filename = null;
            string fileType = null;
            string fileData = null;
            byte[] fileContents = null;

            if (Request.Files.Count > 0)
            { //we are uploading the old way
                var file = Request.Files[0];
                fileContents = new byte[file.ContentLength];
                file.InputStream.Read(fileContents, 0, file.ContentLength);
                fileType = file.ContentType;
                filename = file.FileName;

                IDictionary<string, object> dict = new Dictionary<string, object>();
                foreach (string key in Request.Form.Keys)
                {
                    dict.Add(key, Request.Form.GetValues(key).FirstOrDefault());
                }
                dynamic dobj = dict.ToExpando();

                fileData = Newtonsoft.Json.JsonConvert.SerializeObject(dobj);
            }
            else if (Request.ContentLength > 0)
            {
                // Using FileAPI the content is in Request.InputStream!!!!
                fileContents = new byte[Request.ContentLength];
                Request.InputStream.Read(fileContents, 0, Request.ContentLength);
                filename = Request.Headers["X-File-Name"];
                fileType = Request.Headers["X-File-Type"];
                fileData = Request.Headers["X-File-Data"];
            }

            return new UploadedFile()
            {
                Filename = filename,
                ContentType = fileType,
                FileSize = fileContents != null ? fileContents.Length : 0,
                Contents = fileContents,
                FileData = fileData
            };
        }
    }
}