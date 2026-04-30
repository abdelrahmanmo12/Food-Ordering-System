package com.foodordering.auth.Jwt;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;


public class KeyUtils {

    public static PrivateKey parsePrivateKey(String pem) throws Exception {

        String cleanPem = pem.replaceAll("\\s", "");
        
        byte[] encoded = Base64.getDecoder().decode(cleanPem);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(new PKCS8EncodedKeySpec(encoded));
    }

    public static PublicKey parsePublicKey(String pem) throws Exception {
        String cleanPem = pem.replaceAll("\\s", "");
        
        byte[] encoded = Base64.getDecoder().decode(cleanPem);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(new X509EncodedKeySpec(encoded));
    }
}


// public final class KeyUtils {

//     private KeyUtils() {}

//     public static PrivateKey getPrivateKey(String privateKeyStr) throws Exception {
//         String cleanKey = privateKeyStr.replaceAll("\\s+", "");
//         byte[] keyBytes = Base64.getDecoder().decode(cleanKey);
//         PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
//         return KeyFactory.getInstance("RSA").generatePrivate(spec);
//     }

//     public static PublicKey getPublicKey(String publicKeyStr) throws Exception {
//         String cleanKey = publicKeyStr.replaceAll("\\s+", "");
//         byte[] keyBytes = Base64.getDecoder().decode(cleanKey);
//         X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
//         return KeyFactory.getInstance("RSA").generatePublic(spec);
//     }
// }