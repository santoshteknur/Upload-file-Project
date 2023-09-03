using MVCMultipleFileUpload.Helpers;
using MVCMultipleFileUpload.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace MVCMultipleFileUpload.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult UploadFile()
        {
            return View();
        }

        [HttpPost]
        public async Task<string> UploadFilePost()
        {
            FileUploadHelper handler = new FileUploadHelper();

            //Retriev the file from the request
            UploadedFile fileObj = handler.GetFileFromRequest(this.Request);

            //Write file to disc
            System.IO.File.WriteAllBytes(Path.Combine(Server.MapPath("~/App_Data/"), Guid.NewGuid() + Path.GetExtension(fileObj.Filename)), fileObj.Contents);

            return "File uploaded";
        }
    }
}