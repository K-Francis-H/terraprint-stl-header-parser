#!/usr/bin/python3

import sys
import struct

STL_HEADER_LEN = 80
TERRAPRINT_HEADER_FLAG = 207

filename = sys.argv[1]
fd = open(filename, 'rb')

stl_header = fd.read(STL_HEADER_LEN)
fd.close()

if stl_header[0] != TERRAPRINT_HEADER_FLAG:
	print("unrecognized header format...")
	exit()

nw_lat = struct.unpack('f', stl_header[1:5])[0]
nw_lon = struct.unpack('f', stl_header[5:9])[0]

se_lat = struct.unpack('f', stl_header[9:13])[0]
se_lon = struct.unpack('f', stl_header[13:17])[0]

ne_lat = se_lat
ne_lon = nw_lon

sw_lat = nw_lat
sw_lon = se_lon

resolution = struct.unpack('f', stl_header[17:21])[0]
length_pix = struct.unpack('i', stl_header[21:25])[0]
width_pix = struct.unpack('i', stl_header[25:29])[0]
max_alt = struct.unpack('i', stl_header[29:33])[0]
min_alt = struct.unpack('i', stl_header[33:37])[0]
length_m = resolution * length_pix
width_m = resolution * width_pix

planet_name_len = stl_header[37]
planet_name = stl_header[38:38+planet_name_len].decode('ascii')#struct.unpack('s', stl_header[38:38+planet_name_len])[0]

coord_sys_name_len = stl_header[38+planet_name_len]
coord_sys = stl_header[39+planet_name_len:39+planet_name_len+coord_sys_name_len].decode('ascii')#struct.unpack('s', stl_header[39+planet_name_len:39+palnet_name_len+coord_sys_name_len])[0]

print("planet: "+planet_name)
print("coordinate system: "+coord_sys)

print("NW Latitude: "+str(nw_lat))
print("NW Longitude: "+str(nw_lon))

print("NE Latitude: "+str(ne_lat))
print("NE Longitude: "+str(ne_lon))

print("SW Latitude: "+str(sw_lat))
print("SW Longitude: "+str(sw_lon))

print("SE Latitude: "+str(se_lat))
print("SE Longitude: "+str(se_lon))

print("resolution (m/pix): "+str(resolution))
print("length (pix): "+str(length_pix))
print("width (pix): "+str(width_pix))
print("length (m): "+str(length_m))
print("width (m): "+str(width_m))
print("high point (m): "+str(max_alt))
print("low point (m): "+str(min_alt))


