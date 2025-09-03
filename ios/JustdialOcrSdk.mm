#import "JustdialOcrSdk.h"
#import <UIKit/UIKit.h>
#import <VisionKit/VisionKit.h>
#import <Vision/Vision.h>
#import <PhotosUI/PhotosUI.h>

@interface JustdialOcrSdk () <VNDocumentCameraViewControllerDelegate, PHPickerViewControllerDelegate>
@property (nonatomic, strong) RCTPromiseResolveBlock documentScannerResolve;
@property (nonatomic, strong) RCTPromiseRejectBlock documentScannerReject;
@property (nonatomic, strong) RCTPromiseResolveBlock textRecognitionResolve;
@property (nonatomic, strong) RCTPromiseRejectBlock textRecognitionReject;
@end

@implementation JustdialOcrSdk
RCT_EXPORT_MODULE()

- (NSNumber *)multiply:(double)a b:(double)b {
    NSNumber *result = @(a * b);
    return result;
}

RCT_EXPORT_METHOD(optimizeImage:(NSString *)imageUri 
                  maxDimension:(double)maxDimension
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSURL *url = [NSURL URLWithString:imageUri];
        NSData *imageData = [NSData dataWithContentsOfURL:url];
        
        if (!imageData) {
            reject(@"IMAGE_DECODE_ERROR", @"Failed to load image data", nil);
            return;
        }
        
        UIImage *originalImage = [UIImage imageWithData:imageData];
        if (!originalImage) {
            reject(@"IMAGE_DECODE_ERROR", @"Failed to decode image", nil);
            return;
        }
        
        // Calculate optimal dimensions maintaining aspect ratio
        CGFloat aspectRatio = originalImage.size.width / originalImage.size.height;
        CGSize newSize;
        
        if (originalImage.size.width > originalImage.size.height) {
            newSize.width = MIN(originalImage.size.width, maxDimension);
            newSize.height = newSize.width / aspectRatio;
        } else {
            newSize.height = MIN(originalImage.size.height, maxDimension);
            newSize.width = newSize.height * aspectRatio;
        }
        
        // Resize image
        UIGraphicsBeginImageContextWithOptions(newSize, NO, 1.0);
        [originalImage drawInRect:CGRectMake(0, 0, newSize.width, newSize.height)];
        UIImage *resizedImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        
        // Convert to base64
        NSData *jpegData = UIImageJPEGRepresentation(resizedImage, 0.85);
        NSString *base64String = [jpegData base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithLineFeed];
        
        resolve(base64String);
    }
    @catch (NSException *exception) {
        reject(@"IMAGE_OPTIMIZATION_ERROR", 
               [NSString stringWithFormat:@"Failed to optimize image: %@", exception.reason], nil);
    }
}

RCT_EXPORT_METHOD(validateImage:(NSString *)imageUri
                  maxFileSizeBytes:(double)maxFileSizeBytes
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSURL *url = [NSURL URLWithString:imageUri];
        
        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        
        // Check file existence and size
        NSError *error;
        NSNumber *fileSize;
        [url getResourceValue:&fileSize forKey:NSURLFileSizeKey error:&error];
        
        if (error) {
            result[@"isValid"] = @NO;
            result[@"error"] = @"File does not exist or cannot be accessed";
            resolve(result);
            return;
        }
        
        if ([fileSize doubleValue] > maxFileSizeBytes) {
            result[@"isValid"] = @NO;
            result[@"error"] = @"File size exceeds limit";
            resolve(result);
            return;
        }
        
        // Check if it's a valid image
        NSData *imageData = [NSData dataWithContentsOfURL:url];
        UIImage *image = [UIImage imageWithData:imageData];
        
        if (!image) {
            result[@"isValid"] = @NO;
            result[@"error"] = @"Invalid image format";
        } else {
            result[@"isValid"] = @YES;
        }
        
        resolve(result);
    }
    @catch (NSException *exception) {
        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        result[@"isValid"] = @NO;
        result[@"error"] = [NSString stringWithFormat:@"Validation failed: %@", exception.reason];
        resolve(result);
    }
}

RCT_EXPORT_METHOD(getImageDimensions:(NSString *)imageUri
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSURL *url = [NSURL URLWithString:imageUri];
        NSData *imageData = [NSData dataWithContentsOfURL:url];
        
        if (!imageData) {
            reject(@"DIMENSIONS_ERROR", @"Failed to load image data", nil);
            return;
        }
        
        UIImage *image = [UIImage imageWithData:imageData];
        if (!image) {
            reject(@"DIMENSIONS_ERROR", @"Failed to decode image", nil);
            return;
        }
        
        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        result[@"width"] = @((int)image.size.width);
        result[@"height"] = @((int)image.size.height);
        
        resolve(result);
    }
    @catch (NSException *exception) {
        reject(@"DIMENSIONS_ERROR", 
               [NSString stringWithFormat:@"Failed to get image dimensions: %@", exception.reason], nil);
    }
}

RCT_EXPORT_METHOD(openDocumentScanner:(BOOL)enableGalleryImport
                  scannerMode:(NSString *)scannerMode
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (@available(iOS 13.0, *)) {
            self.documentScannerResolve = resolve;
            self.documentScannerReject = reject;
            
            VNDocumentCameraViewController *documentCameraViewController = [[VNDocumentCameraViewController alloc] init];
            documentCameraViewController.delegate = self;
            
            UIViewController *presentingViewController = RCTPresentedViewController();
            if (presentingViewController) {
                [presentingViewController presentViewController:documentCameraViewController animated:YES completion:nil];
            } else {
                reject(@"NO_PRESENTING_CONTROLLER", @"No presenting view controller available", nil);
            }
        } else {
            reject(@"UNSUPPORTED_VERSION", @"Document scanner requires iOS 13.0 or later", nil);
        }
    });
}

RCT_EXPORT_METHOD(recognizeTextFromImage:(NSString *)imageUri
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        self.textRecognitionResolve = resolve;
        self.textRecognitionReject = reject;
        
        NSURL *url = [NSURL URLWithString:imageUri];
        NSData *imageData = [NSData dataWithContentsOfURL:url];
        
        if (!imageData) {
            reject(@"IMAGE_LOAD_ERROR", @"Failed to load image data", nil);
            return;
        }
        
        UIImage *image = [UIImage imageWithData:imageData];
        if (!image) {
            reject(@"IMAGE_DECODE_ERROR", @"Failed to decode image", nil);
            return;
        }
        
        VNImageRequestHandler *requestHandler = [[VNImageRequestHandler alloc] initWithCGImage:image.CGImage options:@{}];
        VNRecognizeTextRequest *request = [[VNRecognizeTextRequest alloc] initWithCompletionHandler:^(VNRequest *request, NSError *error) {
            if (error) {
                reject(@"TEXT_RECOGNITION_ERROR", @"Failed to recognize text", error);
                return;
            }
            
            NSMutableDictionary *result = [NSMutableDictionary dictionary];
            NSMutableArray *textBlocks = [NSMutableArray array];
            NSMutableString *fullText = [NSMutableString string];
            
            for (VNRecognizedTextObservation *observation in request.results) {
                VNRecognizedText *recognizedText = [observation topCandidates:1].firstObject;
                if (recognizedText) {
                    [fullText appendString:recognizedText.string];
                    [fullText appendString:@"\n"];
                    
                    NSMutableDictionary *blockData = [NSMutableDictionary dictionary];
                    blockData[@"text"] = recognizedText.string;
                    
                    CGRect boundingBox = observation.boundingBox;
                    NSDictionary *bounds = @{
                        @"left": @(boundingBox.origin.x),
                        @"top": @(boundingBox.origin.y),
                        @"right": @(boundingBox.origin.x + boundingBox.size.width),
                        @"bottom": @(boundingBox.origin.y + boundingBox.size.height)
                    };
                    blockData[@"boundingBox"] = bounds;
                    
                    [textBlocks addObject:blockData];
                }
            }
            
            result[@"fullText"] = fullText;
            result[@"textBlocks"] = textBlocks;
            
            dispatch_async(dispatch_get_main_queue(), ^{
                resolve(result);
            });
        }];
        
        request.recognitionLevel = VNRequestTextRecognitionLevelAccurate;
        
        NSError *error;
        [requestHandler performRequests:@[request] error:&error];
        
        if (error) {
            reject(@"VISION_REQUEST_ERROR", @"Failed to perform vision request", error);
        }
        
    } @catch (NSException *exception) {
        reject(@"ML_KIT_ERROR", 
               [NSString stringWithFormat:@"Failed to process image: %@", exception.reason], nil);
    }
}

RCT_EXPORT_METHOD(installMLKitModules:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // iOS doesn't require module installation like Android
    resolve(@"ML Kit modules are built-in on iOS");
}

RCT_EXPORT_METHOD(openImagePicker:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (@available(iOS 14, *)) {
            self.documentScannerResolve = resolve;
            self.documentScannerReject = reject;
            
            PHPickerConfiguration *configuration = [[PHPickerConfiguration alloc] init];
            configuration.selectionLimit = 1;
            configuration.filter = [PHPickerFilter imagesFilter];
            
            PHPickerViewController *pickerViewController = [[PHPickerViewController alloc] initWithConfiguration:configuration];
            pickerViewController.delegate = self;
            
            UIViewController *presentingViewController = RCTPresentedViewController();
            if (presentingViewController) {
                [presentingViewController presentViewController:pickerViewController animated:YES completion:nil];
            } else {
                reject(@"NO_PRESENTING_CONTROLLER", @"No presenting view controller available", nil);
            }
        } else {
            reject(@"UNSUPPORTED_VERSION", @"Image picker requires iOS 14.0 or later", nil);
        }
    });
}

#pragma mark - VNDocumentCameraViewControllerDelegate

- (void)documentCameraViewController:(VNDocumentCameraViewController *)controller didFinishWithScan:(VNDocumentCameraScan *)scan API_AVAILABLE(ios(13.0)) {
    NSMutableArray *pages = [NSMutableArray array];
    
    for (NSUInteger i = 0; i < scan.pageCount; i++) {
        UIImage *scannedImage = [scan imageOfPageAtIndex:i];
        
        // Save image to temporary directory
        NSData *imageData = UIImageJPEGRepresentation(scannedImage, 0.8);
        NSString *fileName = [NSString stringWithFormat:@"scanned_page_%lu.jpg", (unsigned long)i];
        NSURL *tempURL = [NSURL fileURLWithPath:[NSTemporaryDirectory() stringByAppendingPathComponent:fileName]];
        
        if ([imageData writeToURL:tempURL atomically:YES]) {
            NSDictionary *pageData = @{@"imageUri": tempURL.absoluteString};
            [pages addObject:pageData];
        }
    }
    
    NSDictionary *result = @{
        @"success": @YES,
        @"pages": pages
    };
    
    [controller dismissViewControllerAnimated:YES completion:^{
        if (self.documentScannerResolve) {
            self.documentScannerResolve(result);
            self.documentScannerResolve = nil;
            self.documentScannerReject = nil;
        }
    }];
}

- (void)documentCameraViewControllerDidCancel:(VNDocumentCameraViewController *)controller API_AVAILABLE(ios(13.0)) {
    [controller dismissViewControllerAnimated:YES completion:^{
        if (self.documentScannerReject) {
            self.documentScannerReject(@"SCANNER_CANCELLED", @"Document scanner was cancelled", nil);
            self.documentScannerResolve = nil;
            self.documentScannerReject = nil;
        }
    }];
}

- (void)documentCameraViewController:(VNDocumentCameraViewController *)controller didFailWithError:(NSError *)error API_AVAILABLE(ios(13.0)) {
    [controller dismissViewControllerAnimated:YES completion:^{
        if (self.documentScannerReject) {
            self.documentScannerReject(@"SCANNER_ERROR", @"Document scanner failed", error);
            self.documentScannerResolve = nil;
            self.documentScannerReject = nil;
        }
    }];
}

#pragma mark - PHPickerViewControllerDelegate

- (void)picker:(PHPickerViewController *)picker didFinishPicking:(NSArray<PHPickerResult *> *)results API_AVAILABLE(ios(14)) {
    [picker dismissViewControllerAnimated:YES completion:^{
        if (results.count == 0) {
            if (self.documentScannerReject) {
                self.documentScannerReject(@"PICKER_CANCELLED", @"Image picker was cancelled", nil);
                self.documentScannerResolve = nil;
                self.documentScannerReject = nil;
            }
            return;
        }
        
        PHPickerResult *result = results.firstObject;
        [result.itemProvider loadObjectOfClass:[UIImage class] completionHandler:^(__kindof id<NSItemProviderReading>  _Nullable object, NSError * _Nullable error) {
            if (error || !object) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    if (self.documentScannerReject) {
                        self.documentScannerReject(@"IMAGE_LOAD_ERROR", @"Failed to load selected image", error);
                        self.documentScannerResolve = nil;
                        self.documentScannerReject = nil;
                    }
                });
                return;
            }
            
            UIImage *selectedImage = (UIImage *)object;
            NSData *imageData = UIImageJPEGRepresentation(selectedImage, 0.8);
            NSString *fileName = [NSString stringWithFormat:@"selected_image_%f.jpg", [[NSDate date] timeIntervalSince1970]];
            NSURL *tempURL = [NSURL fileURLWithPath:[NSTemporaryDirectory() stringByAppendingPathComponent:fileName]];
            
            if ([imageData writeToURL:tempURL atomically:YES]) {
                NSDictionary *resultData = @{
                    @"success": @YES,
                    @"pages": @[@{@"imageUri": tempURL.absoluteString}]
                };
                
                dispatch_async(dispatch_get_main_queue(), ^{
                    if (self.documentScannerResolve) {
                        self.documentScannerResolve(resultData);
                        self.documentScannerResolve = nil;
                        self.documentScannerReject = nil;
                    }
                });
            } else {
                dispatch_async(dispatch_get_main_queue(), ^{
                    if (self.documentScannerReject) {
                        self.documentScannerReject(@"FILE_SAVE_ERROR", @"Failed to save selected image", nil);
                        self.documentScannerResolve = nil;
                        self.documentScannerReject = nil;
                    }
                });
            }
        }];
    }];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeJustdialOcrSdkSpecJSI>(params);
}

@end
