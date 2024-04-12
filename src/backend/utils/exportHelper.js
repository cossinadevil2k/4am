const fs = require('fs');
const { dialog } = require('electron');
const XLSX = require('xlsx');
const { parse } = require('json2csv');

class ExportHelper {
    constructor() { }

    // 导出数据为Excel格式
    static exportExcel(data, fields, style, outputPath) {
        const ws = XLSX.utils.json_to_sheet(data, { header: fields });
        ws['!cols'] = style
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        fs.writeFile(outputPath, excelBuffer, (err) => {
            if (err) {
                console.error('写入文件失败:', err);
            } else {
                console.log('文件写入成功:', outputPath);
            }
        });
    }

    // 导出数据为CSV格式
    static exportCsv(data, fields, outputPath) {
        const csv = parse(data, { fields });
        fs.writeFileSync(outputPath, csv);
    }

    // 显示保存对话框，选择导出位置
    static showSaveDialog(defaultPath, callback) {
        dialog.showSaveDialog({
            title: '选择导出位置',
            defaultPath: defaultPath,
            filters: [{ name: 'Excel Files', extensions: ['xlsx'] }, { name: 'CSV Files', extensions: ['csv'] }]
        }).then(result => {
            if (!result.canceled && result.filePath) {
                callback(result.filePath);
            }
        }).catch(err => {
            console.error('导出失败:', err);
        });
    }

    // 导出数据，根据传入的格式选择导出方法
    static exportData(data, fields, style, format, defaultPath) {
        this.showSaveDialog(defaultPath, (outputPath) => {
            switch (format) {
                case 'excel':
                    this.exportExcel(data, fields, style, outputPath);
                    break;
                case 'csv':
                    this.exportCsv(data, fields, outputPath);
                    break;
                default:
                    console.error('不支持的导出格式');
            }
        });
    }
}

module.exports = ExportHelper;
