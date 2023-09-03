function FileUploadViewModel(uploadUrl, dropBoxID, defaultFileImg, supportedExtentions, dataHeaderObj) {
    var self = this;

    self.uploadUrl = uploadUrl;
    self.dropBoxID = dropBoxID;
    self.defaultFileImg = defaultFileImg;
    self.supportedExtentions = supportedExtentions;
    self.dataHeaderObj = dataHeaderObj;

    self.showResults = ko.observable(false);
    self.showFileSelect = ko.observable(true);
    self.showSubmit = ko.observable(true);
    self.fileObj = function (fileName, fileSize, uploadPercentage, messages, showMessages) {
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.imgSrc = ko.observable("");
        this.uploadPercentage = ko.observable(uploadPercentage);
        this.messages = ko.observable(messages);
        this.showMessages = ko.observable(showMessages);
    }
    self.fileList = ko.observableArray([]);

    self.init = function () {
        // Check if FileAPI and XmlHttpRequest.upload are supported, so that we can hide the old style input method
        if (window.File && window.FileReader && window.FileList && window.Blob && new XMLHttpRequest().upload) {
            self.showFileSelect(false);
            self.showSubmit(false);

            var dropbox = document.getElementById(self.dropBoxID);
            // init event handlers
            dropbox.addEventListener("dragenter", self.dragEnter, false);
            dropbox.addEventListener("dragexit", self.dragExit, false);
            dropbox.addEventListener("dragleave", self.dragExit, false);
            dropbox.addEventListener("dragover", self.dragOver, false);
            dropbox.addEventListener("drop", self.drop, false);
        }
    }

    self.dragEnter = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
    }

    self.dragExit = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        $("#" + self.dropBoxID).removeClass("active-dropzone");
    }

    self.dragOver = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        $("#" + self.dropBoxID).addClass("active-dropzone");
    }

    self.drop = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        $("#" + self.dropBoxID).removeClass("active-dropzone");

        var files = evt.dataTransfer.files;
        var count = files.length;
        self.fileList.removeAll();

        // Only call the handler if a file was dropped
        if (count > 0) {
            self.showResults(true);
            self.handleFiles(files);
        }
        else {
            self.showResults(false);
        }
    }

    self.handleFiles = function (files) {

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var re = /(?:\.([^.]+))?$/;

            var extention = re.exec(file.name)[1];
            var fileName = file.name;
            if (fileName.length > 100) {
                fileName = fileName.substring(0, 100);
                fileName = fileName + "...";
            }
            var size = file.size / 1024;
            size = Math.round(size * Math.pow(10, 2)) / Math.pow(10, 2);

            var fileModel = new self.fileObj(fileName, size + "Kb", "0%", "", false);
            self.fileList.push(fileModel);

            if ($.inArray(extention, self.supportedExtentions) > -1) {

                self.HandleFilePreview(file, fileModel);
                this.UploadFile(file, fileModel);
            }
            else {
                var message = "File type not valid for file " + file.name + ".";
                fileModel.messages(message);
                fileModel.showMessages(true);
            }
        }
    }

    self.HandleFilePreview = function (file, fileModel) {
        if (file.type.match('^image/')) {
            var reader = new FileReader();
            // init the reader event handlers
            reader.onloadend = function (evt) {
                fileModel.imgSrc(evt.target.result);
            };

            // begin the read operation            
            reader.readAsDataURL(file);
        }
        else {
            fileModel.imgSrc(self.defaultFileImg);
        }
    }

    self.UploadFile = function (file, fileModel) {
        fileModel.uploadPercentage("0%");

        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var percentageUploaded = parseInt(100 - (evt.loaded / evt.total * 100));
                fileModel.uploadPercentage(percentageUploaded + "%");
            }
        }, false);

        // File uploaded
        xhr.addEventListener("load", function () {
            fileModel.uploadPercentage("100%");
        }, false);

        // file received/failed
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    console.log(xhr);
                    fileModel.messages(xhr.responseText);
                    fileModel.showMessages(true);
                }
            }
        };

        xhr.open("POST", self.uploadUrl, true);

        // Set appropriate headers        
        xhr.setRequestHeader("Content-Type", "multipart/form-data");
        xhr.setRequestHeader("X-File-Name", file.name);
        xhr.setRequestHeader("X-File-Size", file.size);
        xhr.setRequestHeader("X-File-Type", file.type);
        if (self.dataHeaderObj != null && self.dataHeaderObj != "") {
            xhr.setRequestHeader("X-File-Data", self.dataHeaderObj);
        }

        // Send the file                        
        xhr.send(file);
    }

    //Load View Model
    self.init();
}