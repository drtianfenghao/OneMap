from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from django.shortcuts import HttpResponse
from index import models
# Create your views here.
def index(request):
    if request.method == 'POST':
        username = request.POST.get('username',None)
        password = request.POST.get('password',None)
        models.UserInfo.objects.create(user = username,pwd = password)
    user_list = models.UserInfo.objects.all()

    return render(request,'index.html',{'data':user_list})

