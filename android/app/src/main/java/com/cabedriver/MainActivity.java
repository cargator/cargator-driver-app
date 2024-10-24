package com.codeb.sukamexpress;

import android.content.Intent;
import android.os.Bundle; // here
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.modules.core.DeviceEventManagerModule;
// react-native-splash-screen >= 0.3.1
import org.devio.rn.splashscreen.SplashScreen; // here

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

  public boolean isOnNewIntent = false;

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        isOnNewIntent = true;
        ForegroundEmitter();
    }

    @Override
    protected void onStart() {
        super.onStart();
        if(isOnNewIntent == true){}else {
            ForegroundEmitter();
        }
    }

    public  void  ForegroundEmitter(){
        // this method is to send back data from java to javascript so one can easily
        // know which button from notification or the notification button is clicked
        String  main = getIntent().getStringExtra("mainOnPress");
        String  btn = getIntent().getStringExtra("buttonOnPress");
        WritableMap map = Arguments.createMap();
        if (main != null) {
            map.putString("main", main);
        }
        if (btn != null) {
            map.putString("button", btn);
        }
        try {
            getReactInstanceManager().getCurrentReactContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("notificationClickHandle", map);
        } catch (Exception  e) {
            Log.e("SuperLog", "Caught Exception: " + e.getMessage());
        }
    }

  @Override
  protected String getMainComponentName() {
    return "RolDrive";
  }


  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }

   @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);  // here
        super.onCreate(savedInstanceState);
    }
}
