package com.justdialocrsdkexample

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.soloader.SoLoader
import com.justdialocrsdk.JustdialOcrSdkPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.shell.MainReactPackage
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage
import com.th3rdwave.safeareacontext.SafeAreaContextPackage

class MainApplication : Application(), ReactApplication {

  private val mReactNativeHost = object : ReactNativeHost(this) {
    override fun getJSMainModuleName(): String = "index"

    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
    
    override fun getPackages(): List<ReactPackage> {
      // Manually construct package list for RN 0.72 example app
      return listOf(
        MainReactPackage(),
        ReactNativeFirebaseAppPackage(),
        SafeAreaContextPackage(),
        JustdialOcrSdkPackage()
      )
    }
  }

  override fun getReactNativeHost(): ReactNativeHost = mReactNativeHost

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}
