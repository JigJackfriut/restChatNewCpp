# MakeFile for restChat
# server using C++ Microservice
# sudo mkdir /var/www/html/restChat
# sudo chown ubuntu /var/www/html/restChat

all: PutHTML restChat

PutHTML:
	cp restChat.html /var/www/html/restChatNew/
	cp restChat.css /var/www/html/restChatNew/
	cp restChat.js /var/www/html/restChatNew/
	
	echo "Current contents of your HTML directory: "
	ls -l /var/www/html/restChatNew/

restChatNew : restChatNew.cpp httplib.h
	$(CXX) -o restChatNew $(CXXFLAGS) restChatNew.cpp $(OPENSSL_SUPPORT) $(ZLIB_SUPPORT) $(BROTLI_SUPPORT) 

clean:
	rm restChatNew *.o
