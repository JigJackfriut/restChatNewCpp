# MakeFile for restChatNew
# server using C++ Microservice
# sudo mkdir /var/www/html/restChatNew
# sudo chown ubuntu /var/www/html/restChatNew

all: PutHTML restChatNew

PutHTML:
	cp restChatNew.html /var/www/html/restChatNew/
	cp restChatNew.css /var/www/html/restChatNew/
	cp restChatNew.js /var/www/html/restChatNew/
	
	echo "Current contents of your HTML directory: "
	ls -l /var/www/html/restChatNew/

restChatNew : restChatNew.cpp httplib.h
	$(CXX) -o restChatNew $(CXXFLAGS) restChatNew.cpp $(OPENSSL_SUPPORT) $(ZLIB_SUPPORT) $(BROTLI_SUPPORT) 

clean:
	rm restChatNew *.o
