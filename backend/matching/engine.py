WEIGHTS={'cleanliness':20,'sleep_schedule':15,'guest_frequency':15,'smoking':15,'pets':10,'work_mode':15,'noise_preference':10}
def match_profiles(a,b):
 score=0;max_score=0;agreements=[];differences=[]
 for key,weight in WEIGHTS.items():
  av=getattr(a,key,'');bv=getattr(b,key,'')
  if not av or not bv:continue
  max_score+=weight
  if key=='cleanliness':
   points=max(0,weight-abs(int(av)-int(bv))*5)
   if points==weight:agreements.append('Similar cleanliness expectations')
   else:differences.append('Different cleanliness preferences')
  else:
   points=weight if av==bv else 0
   if points:agreements.append(f'Both prefer {key.replace("_"," ")}: {av}')
   else:differences.append(f'Different {key.replace("_"," ")} preferences')
  score+=points
 return {'score':round(score/max_score*100) if max_score else None,'agreements':agreements,'differences':differences,'note':'Preference comparison only. Discuss differences before making a housing decision.'}
