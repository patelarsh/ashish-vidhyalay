import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, Loader2, School, MapPin, Phone, Mail, User, GraduationCap, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

import { gu } from "date-fns/locale";

const formSchema = z.object({
  grade: z.string().min(1, "કૃપા કરીને ધોરણ પસંદ કરો"),
  studentName: z.string().min(3, { message: "વિદ્યાર્થીનું નામ ઓછામાં ઓછું ૩ અક્ષરનું હોવું જોઈએ" }),
  gender: z.enum(["Kumar", "Kanya"]),
  dob: z.date(),
  mobile: z.string().regex(/^[0-9]{10}$/, { message: "કૃપા કરીને સાચો ૧૦ આંકડાનો મોબાઈલ નંબર નાખો" }),
  address: z.string().min(1, "કૃપા કરીને રહેઠાણનું સરનામું પસંદ કરો"),
  otherVillage: z.string().optional(),
  email: z.string().email({ message: "કૃપા કરીને સાચું ઈમેલ એડ્રેસ નાખો" }),
});

type FormValues = z.infer<typeof formSchema>;

const villages = [
  "કેશરપુરા, તા ઈડર", "હરિપુરા, તા ઈડર", "ઝહિરપુરા, તા ઈડર", "કિશોરગઢ, તા ઈડર",
  "જેઠીપુરા, તા ઈડર", "જીવાપુર, તા ઈડર", "અરોડા, તા ઈડર", "બોલુંદ્રા, તા ઈડર",
  "જાદર, તા ઈડર", "દરામલી, તા ઈડર", "દાવડ તા, ઈડર", "પ્રેમપુર તા, ઈડર",
  "ગઢા તા, હિમતનગર", "માનગઢ તા, ઈડર", "વક્તાપુર તા, હિમતનગર", "દેશોતર તા, ઈડર",
  "બડોલી તા, ઈડર", "ગંભીરપુરા તા, ઈડર", "સુરપુર તા, ઈડર", "કાબસો ગઢા તા, ઈડર",
  "માઢવા તા, ઈડર", "રંગપુર તા, ઈડર", "હરિઓમ કંપા તા, હિમતનગર", "ફિયોડ તા, ઈડર",
  "સાયોદર તા, હિમતનગર", "અન્ય"
];

const grades = [
  "બાલવાટીકા", "ધોરણ ૧", "ધોરણ ૨", "ધોરણ ૩", "ધોરણ ૪", "ધોરણ ૫",
  "ધોરણ ૬", "ધોરણ ૭", "ધોરણ ૮", "ધોરણ ૯", "ધોરણ ૧૦",
  "ધોરણ ૧૧ સામાન્ય પ્રવાહ", "ધોરણ ૧૧ વિજ્ઞાન પ્રવાહ",
  "ધોરણ ૧૨ સામાન્ય પ્રવાહ", "ધોરણ ૧૨ વિજ્ઞાન પ્રવાહ"
];

const facilities = [
  "અત્યાધુનિક લેબોરેટરી", "કોમ્પ્યુટર લેબ", "R O પ્લાન્ટ તથા વોટર કૂલર",
  "fire સેફટી", "સ્માર્ટ ક્લાસરૂમ", "શિક્ષણ ક્ષેત્રે નામાંકિત શિક્ષકોનો સ્ટાફ",
  "અલગ અલગ પ્રવૃત્તિઓ દ્વારા શિક્ષણ", "સાયન્સ તથા ટેકનોલોજી નો ભરપૂર ઉપયોગ સાથેનું શિક્ષણ",
  "દરેક વિદ્યાર્થીનું પર્સનલ ધ્યાન તથા સતત વાલી સંપર્ક", "સમયાંતરે ટેસ્ટ",
  "Result ની ક્ષમતા પ્રમાણે 100% ગેરંટી", "ટ્રાવેલિંગ સુવિધા",
  "ડૉ વિક્રમ સારાભાઈ સાયન્સ સેન્ટર"
];

export default function AdmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      mobile: "",
      otherVillage: "",
      email: "",
      grade: "",
      address: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dob: format(values.dob, "yyyy-MM-dd"),
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success("અરજી સફળતાપૂર્વક સબમિટ થઈ ગઈ છે!");
      } else {
        const error = await response.json();
        toast.error(error.error || "કંઈક ભૂલ થઈ છે. કૃપા કરીને ફરી પ્રયાસ કરો.");
      }
    } catch (error) {
      toast.error("સર્વર સાથે જોડાણ થઈ શક્યું નથી.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">અરજી સફળતાપૂર્વક સબમિટ થઈ ગઈ છે!</h2>
        <p className="text-lg text-gray-600 mb-8">
          તમારા ઈમેલ પર પુષ્ટિકરણ મોકલવામાં આવ્યું છે. અમારી ટીમ ટૂંક સમયમાં તમારો સંપર્ક કરશે.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          બીજી અરજી કરો
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="relative inline-block mb-6">
          <div className="w-48 h-48 mx-auto flex items-center justify-center">
            <img 
              src="https://ashishvidhyalay.com/ADM/logo.png" 
              alt="Ashish Vidhyalay Logo" 
              className="w-full h-full object-contain drop-shadow-2xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to the school icon if image fails to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = "w-32 h-36 mx-auto bg-red-700 rounded-b-[40%] rounded-t-lg flex items-center justify-center shadow-2xl border-4 border-white relative overflow-hidden";
                  fallback.innerHTML = '<div class="absolute inset-0 bg-gradient-to-b from-red-600 to-red-800 opacity-50"></div><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school relative z-10"><path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M18 5v17"/><path d="m4 6 8-4 8 4"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/></svg>';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mt-8 mb-6">
          આશિષ વિધ્યાલય, કેશરપુરા
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          તમામ સગવડ થી ભરપૂર સુસજ્જ શાળા માં એડમિશન લેવા નીચેની વિગત ભરી આજેજ રજીસ્ટ્રેશન કરો.
        </p>
        <p className="mt-4 text-blue-600 font-semibold text-lg">
          તમારા સ્વપ્ન ને પાંખો આપવા અમે તૈયાર છીએ.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Facilities Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="border-none shadow-lg bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                અન્ય ભૌતિક સુવિધાઓ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {facilities.map((facility, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-500 mt-1">★</span>
                    {facility}
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-white rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">પ્રવેશ માટેની વય મર્યાદા:</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  • ૩૧/૦૫/૨૦૨૬ ના રોજ ૬ વર્ષ પૂર્ણ હોય તે બાળક ધો.૧ માં પ્રવેશ મેળવી શકશે.<br/>
                  • ૩૧/૦૫/૨૦૨૬ ના રોજ ૫ વર્ષ પૂર્ણ હોય તે બાળક બાલવાટીકા માં પ્રવેશ મેળવી શકશે.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-xl border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle className="text-2xl">રજીસ્ટ્રેશન ફોર્મ</CardTitle>
              <CardDescription>
                બાળકની સંપૂર્ણ માહિતી ફોર્મમાં ભરવી. ડોક્યુમેન્ટ્સ જમા કરાવવા ફોન કરીને જાણ કરીશું, ત્યારે રૂબરૂ શાળા માં આવવાનું રહેશે.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grade Selection */}
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-blue-500" />
                            ધોરણ પસંદ કરો *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="ધોરણ પસંદ કરો" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {grades.map((grade) => (
                                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Student Name */}
                    <FormField
                      control={form.control}
                      name="studentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            વિદ્યાર્થી નું પૂરું નામ *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="ઉદા. પટેલ કેયુર જગદીશભાઈ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>વિદ્યાર્થીની જાતિ *</FormLabel>
                          <FormControl>
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="kumar" 
                                  checked={field.value === "Kumar"}
                                  onCheckedChange={() => field.onChange("Kumar")}
                                />
                                <label htmlFor="kumar" className="text-sm font-medium">કુમાર</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="kanya" 
                                  checked={field.value === "Kanya"}
                                  onCheckedChange={() => field.onChange("Kanya")}
                                />
                                <label htmlFor="kanya" className="text-sm font-medium">કન્યા</label>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date of Birth */}
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-blue-500" />
                            જન્મ તારીખ *
                          </FormLabel>
                          <Popover>
                            <FormControl>
                              <PopoverTrigger
                                render={
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: gu })
                                    ) : (
                                      <span>તારીખ પસંદ કરો</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                }
                              />
                            </FormControl>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                captionLayout="dropdown"
                                startMonth={new Date(1900, 0)}
                                endMonth={new Date()}
                                locale={gu}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mobile Number */}
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-500" />
                            વાલીનો મોબાઈલ / વોટ્સએપ નંબર *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="૧૦ આંકડાનો નંબર" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            ઈમેલ એડ્રેસ *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="yourname@example.com" {...field} />
                          </FormControl>
                          <FormDescription>તમારી અરજીની નકલ આ ઈમેલ પર મોકલવામાં આવશે.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Address Dropdown */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            વિદ્યાર્થીના રહેઠાણ નું સરનામું *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="ગામ પસંદ કરો" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {villages.map((village) => (
                                <SelectItem key={village} value={village}>{village}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Other Village */}
                    {form.watch("address") === "અન્ય" && (
                      <FormField
                        control={form.control}
                        name="otherVillage"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>ઉપર સિવાયના અન્ય ગામ</FormLabel>
                            <FormControl>
                              <Input placeholder="ગામનું નામ લખો" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-bold transition-all transform hover:scale-[1.02]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        સબમિટ થઈ રહ્યું છે...
                      </>
                    ) : (
                      "અરજી સબમિટ કરો"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t p-6 flex flex-col gap-2 text-center">
              <p className="text-sm text-gray-500 w-full">
                © ૨૦૨૬ આશિષ વિદ્યાલય, કેશરપુરા. તમામ હકો સુરક્ષિત.
              </p>
              <p className="text-xs text-gray-400 w-full">
                Developed By{" "}
                <a 
                  href="https://www.spaceon.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                >
                  SpaceOn Technology
                </a>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
