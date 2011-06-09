(function () {
	"use strict";

	var recordSize = 512;

	function removePadding(buf) {
		var text = '',
			i, length;

		for (i = 0, length = buf.length; i < buf.length; i += 1) {
			text += String.fromCharCode(buf[i]);
		}

		return parseInt(text.replace(/^0*/, ''), 8) || 0;
	}

	function readString(buf) {
		var text = '',
			i, length;

		for (i = 0, length = buf.length; i < length, buf[i] !== 0; i += 1) {
			text += String.fromCharCode(buf[i]);
		}

		return text;
	}

	function doHeader(buf) {
		var data = {}, offset = 0;

		data.fileName = readString(buf.subarray(offset, offset + 100));
		offset += 100;

		data.fileMode = removePadding(buf.subarray(offset, offset + 8));
		offset += 8;

		data.uid = removePadding(buf.subarray(offset, offset + 8));
		offset += 8;

		data.gid = removePadding(buf.subarray(offset, offset + 8));
		offset += 8;

		data.fileSize = removePadding(buf.subarray(offset, offset + 12));
		offset += 12;

		data.mtime = removePadding(buf.subarray(offset, offset + 12));
		offset += 12;

		data.checksum = removePadding(buf.subarray(offset, offset + 8));
		offset += 8;

		data.type = removePadding(buf.subarray(offset, offset + 1));
		offset += 1;

		data.linkname = readString(buf.subarray(offset, offset + 100));
		offset += 100;

		data.ustar = readString(buf.subarray(offset, offset + 8));
		if (/ustar/.test(data.ustar)) {
			offset += 8;

			data.owner = readString(buf.subarray(offset, offset + 32));
			offset += 32;

			data.group = readString(buf.subarray(offset, offset + 32));
			offset += 32;

			data.majorNumber = removePadding(buf.subarray(offset, offset + 8));
			offset += 8;

			data.minorNumber = removePadding(buf.subarray(offset, offset + 8));
			offset += 8;

			data.filenamePrefix = readString(buf.subarray(offset, offset + 155));
		}

		return data;
	}

	function doFile(buf, cb) {
		var header, offset = 0, numBlocks, fileData;

		header = doHeader(buf);

		offset += recordSize;

		numBlocks = Math.ceil(header.fileSize / recordSize);
		fileData = buf.subarray(offset, offset + header.fileSize);

		offset += numBlocks * recordSize;

		cb(header, fileData, offset);
	}

	/*
	 * Extract data from an input.
	 * 
	 * @param input- must be a buffer
	 * @param opts- object of options
	 * @param cb- callback to call on each file- params: header, fileData (uint8Array)
	 */
	function Untar (input, cb) {
		var offset = 0;

		while(input[offset]) {
			doFile(input.subarray(offset), function (header, fileData, iOffset) {
				offset += iOffset;

				cb(header, fileData);
			});
		}
	}

	module.exports = Untar;

	provide('untar', module.exports);
}());
