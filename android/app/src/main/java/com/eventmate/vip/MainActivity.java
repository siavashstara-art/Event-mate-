package com.eventmate.vip;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

/**
 * EventMate VIP | ایونت‌مِیت
 * 100% Standalone Offline-First Android APK + AAB
 * Loads the bundled React application directly from APK assets/www/index.html
 * via AndroidX WebViewAssetLoader (Zero external server 404 errors).
 */
public class MainActivity extends Activity {

    private WebView webView;
    private static final String LOCAL_APP_URL = "https://appassets.androidplatform.net/assets/www/index.html";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#FAF7F2"));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.addJavascriptInterface(new EventMateBridge(), "EventMateAndroid");
        webView.setWebChromeClient(new WebChromeClient());

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (url != null && "appassets.androidplatform.net".equals(url.getHost())) {
                    String path = url.getPath();
                    if (path != null && path.startsWith("/api/")) {
                        String offlineJson = "{\"ok\":true,\"offlineApk\":true}";
                        return new WebResourceResponse(
                                "application/json",
                                "UTF-8",
                                new ByteArrayInputStream(offlineJson.getBytes(StandardCharsets.UTF_8))
                        );
                    }
                    return assetLoader.shouldInterceptRequest(url);
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri == null) return false;
                String url = uri.toString();
                String host = uri.getHost();

                if ("appassets.androidplatform.net".equals(host)) {
                    return false;
                }

                if (url.startsWith("whatsapp://") || url.contains("wa.me") || url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("http://") || url.startsWith("https://")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "اپلیکیشن مقصد روی گوشی یافت نشد", Toast.LENGTH_SHORT).show();
                    }
                    return true;
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Redirect window.open calls (such as WhatsApp pre-invoices) to native Android Intent
                view.evaluateJavascript(
                        "window.open = function(u) { if(u) { window.location.href = u; } return null; };",
                        null
                );
            }
        });

        webView.loadUrl(LOCAL_APP_URL);
    }

    public class EventMateBridge {
        @JavascriptInterface
        public void showToast(String message) {
            Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
        }

        @JavascriptInterface
        public String getPackageName() {
            return "com.eventmate.vip";
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
