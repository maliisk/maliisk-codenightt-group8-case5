package com.codenight.bip.util;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class TimeUtil {
    public static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT.withZone(ZoneId.of("UTC"));
    public static String iso(Instant i){ return ISO.format(i); }
}
