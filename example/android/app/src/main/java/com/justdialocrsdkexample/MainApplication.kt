package com.justdialocrsdkexample

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader
import com.justdialocrsdk.JustdialOcrSdkPackage

class MainApplication : Application(), ReactApplication {

  private val mReactNativeHost = object : ReactNativeHost(this) {
    override fun getPackages(): List<ReactPackage> {
      val packages = arrayListOf<ReactPackage>()
      packages.add(MainReactPackage())
      packages.add(JustdialOcrSdkPackage())
      return packages
    }

    override fun getJSMainModuleName(): String = "index"

    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
  }

  override fun getReactNativeHost(): ReactNativeHost = mReactNativeHost

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
  }
}
