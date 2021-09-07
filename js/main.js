$(function () {

    // リロードボタンを押したときのアクション
    $('#reload').click(function(){
        let msg = "フレームレート：" + $('#framerate').val() + "  認識回数閾値："+$('#DetectedCount').val();
        $('#setting').val(msg);
        startScanner();
    });

    $('#reload').click();
});

var DetectedCount = 0, DetectedCode = "";

var startScanner = () => {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#photo-area'),
            constraints: {
                decodeBarCodeRate: 3,
                successTimeout: 500,
                codeRepetition: true,
                tryVertical: true,
                frameRate: parseInt($('#framerate').val()),
                width: 1600,
                height: 1200,
                facingMode: "environment",
                area: { top: "0%", right: "0%", left: "0%", bottom: "0%" }
            },
        },
        decoder: {
            readers: [
                "code_39_reader"
            ]
        },

    }, function (err) {
        if (err) {
            console.log(err);
            return
        }

        console.log("Initialization finished. Ready to start");
        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;
    });

    Quagga.onProcessed(function (result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;
        console.log("test");
        if (result) {
            // 検出中の緑の線の枠
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {
                        x: 0,
                        y: 1
                    }, drawingCtx, {
                        color: "green",
                        lineWidth: 2
                    });
                });
            }

            // 読込中の青枠
            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {
                    x: 0,
                    y: 1
                }, drawingCtx, {
                    color: "#00F",
                    lineWidth: 2
                });
            }

            // 検出完了時の赤線
            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {
                    x: 'x',
                    y: 'y'
                }, drawingCtx, {
                    color: 'red',
                    lineWidth: 3
                });
            }
        }
    });

    //barcode read call back
    Quagga.onDetected(function (result) {
        console.log(result.codeResult.code);
        if (DetectedCode == result.codeResult.code) {
            DetectedCount++;
        } else {
            DetectedCount = 0;
            DetectedCode = result.codeResult.code;
        }
        if (DetectedCount >= paserInt($('#DetectedCount').val())) {
            console.log(result.codeResult.code);
            DetectedCode = '';
            DetectedCount = 0;
            $('#result').val(result.codeResult.code);
            document.getElementById("photo-area").style.display = "none";
            Quagga.stop()
        }
    });
}